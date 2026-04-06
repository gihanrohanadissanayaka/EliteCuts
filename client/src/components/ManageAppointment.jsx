import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, CalendarDays, Clock, Package, XCircle, CheckCircle2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { lookupAppointment, updateGuestAppointment, cancelGuestAppointment } from '@/services/appointmentService';
import { getPackages } from '@/services/packageService';
import { useEffect } from 'react';

const TIME_SLOTS = [
  '8:00 AM',  '9:00 AM',  '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM',  '2:00 PM',  '3:00 PM',
  '4:00 PM',  '5:00 PM',  '6:00 PM',  '7:00 PM',
  '8:00 PM',
];

const localDateStr = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const lookupSchema = yup.object({
  phone: yup.string().trim().min(7, 'Enter a valid mobile number').required('Mobile number is required'),
  pin:   yup.string().trim().matches(/^\d{4}$/, 'PIN must be exactly 4 digits').required('PIN is required'),
});

const editSchema = yup.object({
  packageName: yup.string().required('Please select a package'),
  date:        yup.date().required('Please select a date').min(new Date(new Date().setHours(0,0,0,0)), 'Date cannot be in the past'),
  timeSlot:    yup.string().required('Please select a time slot'),
  notes:       yup.string().max(300, 'Notes cannot exceed 300 characters').optional(),
});

const STATUS_COLORS = {
  pending:   'text-gold-400 bg-gold-400/10 border-gold-400/20',
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
  completed: 'text-dark-300 bg-dark-700 border-dark-600',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function AppointmentCard({ appointment, onEdit, onCancel, cancelLoading }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isEditable = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold">{appointment.guestName}</h3>
          <p className="text-dark-400 text-xs mt-0.5">{appointment.guestPhone}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[appointment.status] || ''}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-dark-300">
          <Package className="w-4 h-4 text-gold-500 flex-shrink-0" />
          {appointment.packageName}
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <CalendarDays className="w-4 h-4 text-gold-500 flex-shrink-0" />
          {new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2 text-dark-300">
          <Clock className="w-4 h-4 text-gold-500 flex-shrink-0" />
          {appointment.timeSlot}
        </div>
        {appointment.notes && (
          <p className="text-dark-400 text-xs italic mt-1">"{appointment.notes}"</p>
        )}
      </div>

      {isEditable && (
        <div className="flex gap-2 pt-2 border-t border-dark-700">
          <button
            onClick={() => onEdit(appointment)}
            className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-gold-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-dark-700 flex-1 justify-center"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          {!confirmCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-red-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-dark-700 flex-1 justify-center"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-xs text-dark-400">Confirm cancel?</span>
              <button
                disabled={cancelLoading}
                onClick={() => onCancel(appointment._id)}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1.5 rounded bg-red-400/10 border border-red-400/20 disabled:opacity-50"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                className="text-xs text-dark-400 hover:text-white px-2.5 py-1.5 rounded bg-dark-700"
              >
                No
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditForm({ appointment, pin, packages, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      packageName: appointment.packageName,
      date:        new Date(appointment.date),
      timeSlot:    appointment.timeSlot,
      notes:       appointment.notes || '',
    },
  });

  const selectedDate = watch('date');
  const selectedTime = watch('timeSlot');

  const onSubmit = async (values) => {
    try {
      const updated = await updateGuestAppointment(appointment._id, {
        pin,
        ...values,
        ...(values.date instanceof Date && { date: localDateStr(values.date) }),
      });
      toast.success('Appointment updated!');
      onSave(updated);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <h3 className="text-white font-semibold">Edit Appointment</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Package */}
        <div>
          <label className="label">Package</label>
          <select {...register('packageName')} className="input-field">
            {packages.map((pkg) => (
              <option key={pkg._id} value={pkg.name}>{pkg.name}</option>
            ))}
          </select>
          {errors.packageName && <p className="error-text">{errors.packageName.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(d) => setValue('date', d, { shouldValidate: true })}
            minDate={new Date()}
            filterDate={(d) => d.getDay() !== 0}
            className="input-field w-full"
            dateFormat="MMMM d, yyyy"
            wrapperClassName="w-full"
          />
          {errors.date && <p className="error-text">{errors.date.message}</p>}
        </div>

        {/* Time Slot */}
        <div>
          <label className="label">Time Slot</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setValue('timeSlot', slot, { shouldValidate: true })}
                className={`text-xs py-2.5 rounded-lg border transition-all ${
                  selectedTime === slot
                    ? 'border-gold-500 bg-gold-500/10 text-gold-400 font-medium'
                    : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.timeSlot && <p className="error-text">{errors.timeSlot.message}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes <span className="text-dark-500 font-normal">(optional)</span></label>
          <textarea {...register('notes')} rows={2} className="input-field resize-none" />
          {errors.notes && <p className="error-text">{errors.notes.message}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ManageAppointment() {
  const [phase,         setPhase]         = useState('lookup'); // 'lookup' | 'found' | 'editing' | 'cancelled'
  const [appointment,   setAppointment]   = useState(null);
  const [packages,      setPackages]      = useState([]);
  const [pinValue,      setPinValue]      = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(lookupSchema) });

  const phoneValue = watch('phone');

  useEffect(() => { getPackages().then(setPackages).catch(() => {}); }, []);

  const onLookup = async ({ phone, pin }) => {
    try {
      const appt = await lookupAppointment(phone, pin);
      setPinValue(pin);
      setAppointment(appt);
      setPhase('found');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lookup failed.');
    }
  };

  const handleCancel = async (id) => {
    setCancelLoading(true);
    try {
      await cancelGuestAppointment(id, pinValue);
      setAppointment((prev) => ({ ...prev, status: 'cancelled' }));
      setPhase('cancelled');
      toast.success('Appointment cancelled.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSaveEdit = (updated) => {
    setAppointment(updated);
    setPhase('found');
  };

  if (phase === 'cancelled') {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-green-400/10 border border-green-400/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Appointment Cancelled</h3>
          <p className="text-dark-400 text-sm mt-1">Your appointment has been successfully cancelled.</p>
        </div>
        <button onClick={() => { setPhase('lookup'); setAppointment(null); }} className="btn-secondary text-sm">
          Look up another booking
        </button>
      </div>
    );
  }

  if (phase === 'editing') {
    return (
      <EditForm
        appointment={appointment}
        pin={pinValue}
        packages={packages}
        onSave={handleSaveEdit}
        onCancel={() => setPhase('found')}
      />
    );
  }

  if (phase === 'found' && appointment) {
    return (
      <div className="space-y-4">
        <AppointmentCard
          appointment={appointment}
          onEdit={() => setPhase('editing')}
          onCancel={handleCancel}
          cancelLoading={cancelLoading}
        />
        <button
          onClick={() => { setPhase('lookup'); setAppointment(null); }}
          className="text-sm text-dark-400 hover:text-white transition-colors underline underline-offset-4 block text-center"
        >
          Look up a different booking
        </button>
      </div>
    );
  }

  // Lookup form
  return (
    <div className="card p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-white font-semibold text-lg">Find Your Booking</h2>
        <p className="text-dark-400 text-sm mt-1">
          Enter the mobile number and 4-digit PIN you received when booking.
        </p>
      </div>

      <form onSubmit={handleSubmit(onLookup)} className="space-y-5">
        <div>
          <label className="label">Mobile Number</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+94 7X XXX XXXX"
            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="error-text">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label">4-Digit PIN</label>
          <input
            {...register('pin')}
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="_ _ _ _"
            className={`input-field text-xl tracking-[0.5em] text-center w-32 ${errors.pin ? 'border-red-500' : ''}`}
          />
          {errors.pin && <p className="error-text">{errors.pin.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Searching…
            </span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Find My Appointment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
