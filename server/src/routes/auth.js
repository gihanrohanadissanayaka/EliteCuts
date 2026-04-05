const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate  = require('../middleware/validate');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.patch('/me',      protect, updateMe);

module.exports = router;
