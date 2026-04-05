const bcrypt      = require('bcryptjs');
const Appointment = require('../models/Appointment');

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Strips pinHash before sending appointment data
function safeAppt(appt) {
  const obj = appt.toObject ? appt.toObject() : { ...appt };
  delete obj.pinHash;
  return obj;
}

/* ─── Customer (logged-in) ────────────────────────────────────────── */

// GET /api/appointments/my
async function getMyAppointments(req, res, next) {
  try {
    const appointments = await Appointment.find({ customer: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

/* ─── Guest & logged-in ───────────────────────────────────────────── */

// GET /api/appointments/booked-slots?date=YYYY-MM-DD  (public)
async function getBookedSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required.' });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const taken = await Appointment.find({
      date:   { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot').lean();

    res.json(taken.map((a) => a.timeSlot));
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments  (no auth required)
async function createAppointment(req, res, next) {
  try {
    const { packageName, date, timeSlot, notes, guestName, guestPhone } = req.body;

    const isGuest = !req.user;
    if (isGuest && (!guestName || !guestPhone)) {
      return res.status(400).json({ message: 'Name and mobile number are required.' });
    }

    // Slot conflict check
    const conflict = await Appointment.findOne({
      date:     new Date(date),
      timeSlot,
      status:   { $in: ['pending', 'confirmed'] },
    });
    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    const pin     = generatePin();
    const pinHash = await bcrypt.hash(pin, 10);

    const appointment = await Appointment.create({
      customer:   req.user?._id   || null,
      guestName:  req.user?.name  || guestName,
      guestPhone: req.user?.phone || guestPhone,
      packageName,
      date:       new Date(date),
      timeSlot,
      notes:      notes || '',
      pinHash,
    });

    // Return PIN once in plain text — never stored again
    res.status(201).json({ appointment: safeAppt(appointment), pin });
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments/lookup  (find appointment by phone + PIN)
async function lookupByPin(req, res, next) {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ message: 'Mobile number and PIN are required.' });
    }

    const appointments = await Appointment.find({ guestPhone: phone }).sort({ createdAt: -1 });
    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointment found for this number.' });
    }

    let matched = null;
    for (const appt of appointments) {
      if (appt.pinHash && (await bcrypt.compare(String(pin), appt.pinHash))) {
        matched = appt;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({ message: 'Incorrect PIN.' });
    }

    res.json(safeAppt(matched));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/guest-update  (edit by PIN)
async function updateByPin(req, res, next) {
  try {
    const { pin, packageName, date, timeSlot, notes } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required.' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot edit a cancelled or completed appointment.' });
    }

    const valid = appointment.pinHash && (await bcrypt.compare(String(pin), appointment.pinHash));
    if (!valid) return res.status(401).json({ message: 'Incorrect PIN.' });

    // Slot conflict check (excluding current appointment)
    const newDate     = date     ? new Date(date) : appointment.date;
    const newTimeSlot = timeSlot || appointment.timeSlot;
    const conflict = await Appointment.findOne({
      _id:    { $ne: appointment._id },
      date:   newDate,
      timeSlot: newTimeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    if (packageName)        appointment.packageName = packageName;
    if (date)               appointment.date        = newDate;
    if (timeSlot)           appointment.timeSlot    = newTimeSlot;
    if (notes !== undefined) appointment.notes      = notes;
    await appointment.save();

    res.json(safeAppt(appointment));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/guest-cancel  (cancel by PIN)
async function cancelByPin(req, res, next) {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required.' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled.' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment.' });
    }

    const valid = appointment.pinHash && (await bcrypt.compare(String(pin), appointment.pinHash));
    if (!valid) return res.status(401).json({ message: 'Incorrect PIN.' });

    appointment.status      = 'cancelled';
    appointment.cancelledAt = new Date();
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/cancel  (logged-in customer, own appointment)
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findOne({
      _id:      req.params.id,
      customer: req.user._id,
    });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    if (appointment.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed appointment.' });
    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Appointment is already cancelled.' });

    appointment.status      = 'cancelled';
    appointment.cancelledAt = new Date();
    await appointment.save();

    res.json(safeAppt(appointment));
  } catch (err) {
    next(err);
  }
}

/* ─── Admin ───────────────────────────────────────────────────────── */

// GET /api/appointments  (admin)
async function getAllAppointments(req, res, next) {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date)   filter.date   = new Date(date);

    const appointments = await Appointment.find(filter)
      .populate('customer', 'name email phone')
      .sort({ date: -1 })
      .lean();

    // Strip pinHash from all results
    res.json(appointments.map(({ pinHash: _, ...a }) => a));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/status  (admin)
async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${valid.join(', ')}` });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('customer', 'name email');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    res.json(safeAppt(appointment));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyAppointments,
  createAppointment,
  getBookedSlots,
  lookupByPin,
  updateByPin,
  cancelByPin,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};

