const router = require('express').Router();
const { body } = require('express-validator');
const {
  getMyAppointments,
  createAppointment,
  getBookedSlots,
  lookupByPin,
  updateByPin,
  cancelByPin,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const createRules = [
  body('guestName').if((v, { req }) => !req.user).trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('guestPhone').if((v, { req }) => !req.user).trim().isLength({ min: 7, max: 20 }).withMessage('Enter a valid mobile number'),
  body('packageName').trim().notEmpty().withMessage('Package name is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  body('notes').optional().isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),
];

const lookupRules = [
  body('phone').trim().notEmpty().withMessage('Mobile number is required'),
  body('pin').trim().isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits'),
];

const pinRules = [
  body('pin').trim().isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits'),
];

// Guest & customer routes
router.get('/my',                 protect,         getMyAppointments);
router.get('/booked-slots',                        getBookedSlots);   // public — must be before /:id
router.post('/',                  optionalProtect, createRules, validate, createAppointment);
router.post('/lookup',                             lookupRules, validate, lookupByPin);
router.patch('/:id/guest-update',                 pinRules,    validate, updateByPin);
router.patch('/:id/guest-cancel',                 pinRules,    validate, cancelByPin);
router.patch('/:id/cancel',       protect,         cancelAppointment);

// Admin routes
router.get('/',                   protect, adminOnly, getAllAppointments);
router.patch('/:id/status',       protect, adminOnly, updateAppointmentStatus);

module.exports = router;

