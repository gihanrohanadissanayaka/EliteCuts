const Event = require('../models/Event');

// GET /api/events  (public)
async function getEvents(req, res, next) {
  try {
    const events = await Event.find({ isPublished: true })
      .sort({ date: -1 })
      .lean();
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// GET /api/events/:id  (public)
async function getEventById(req, res, next) {
  try {
    const event = await Event.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

// POST /api/events  (admin)
async function createEvent(req, res, next) {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

// PUT /api/events/:id  (admin)
async function updateEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

// GET /api/events/admin/all  (admin — all events including unpublished)
async function getAllEventsAdmin(req, res, next) {
  try {
    const events = await Event.find({}).sort({ date: -1 }).lean();
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/events/:id  (admin — soft delete)
async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event unpublished.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEvents, getEventById, getAllEventsAdmin, createEvent, updateEvent, deleteEvent };
