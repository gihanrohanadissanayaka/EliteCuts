const router = require('express').Router();
const { body } = require('express-validator');
const {
  getEvents,
  getEventById,
  getAllEventsAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const eventRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').optional().isString(),
  body('tag').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
];

// Public
router.get('/', getEvents);

// Admin — must be before /:id to avoid route conflict
router.get('/admin/all', protect, adminOnly, getAllEventsAdmin);

router.get('/:id', getEventById);

// Admin
router.post('/',    protect, adminOnly, eventRules, validate, createEvent);
router.put('/:id',  protect, adminOnly, eventRules, validate, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
