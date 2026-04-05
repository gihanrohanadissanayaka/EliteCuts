const router = require('express').Router();
const { body } = require('express-validator');
const {
  getReviews,
  createReview,
  approveReview,
  getPendingReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5, max: 500 }).withMessage('Comment must be 5–500 characters'),
  body('customerName').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('service').optional().isString(),
];

// Public
router.get('/', getReviews);

// Open to guests and authenticated users
router.post('/', optionalProtect, reviewRules, validate, createReview);

// Admin
router.get('/pending',         protect, adminOnly, getPendingReviews);
router.patch('/:id/approve',   protect, adminOnly, approveReview);
router.delete('/:id',          protect, adminOnly, deleteReview);

module.exports = router;
