const router = require('express').Router();
const { body } = require('express-validator');
const {
  getPackages,
  getAllPackagesAdmin,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const packageRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  body('popular').optional().isBoolean().withMessage('Popular must be boolean'),
];

// Public
router.get('/',           getPackages);

// Admin — must be before /:id to avoid route conflict
router.get('/admin/all',  protect, adminOnly, getAllPackagesAdmin);
router.post('/',          protect, adminOnly, packageRules, validate, createPackage);
router.put('/:id',        protect, adminOnly, packageRules, validate, updatePackage);
router.delete('/:id',     protect, adminOnly, deletePackage);

// Public (keep last to avoid swallowing /admin/all)
router.get('/:id',        getPackageById);

module.exports = router;
