const Package = require('../models/Package');

// GET /api/packages  (public — active only)
async function getPackages(req, res, next) {
  try {
    const packages = await Package.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(packages);
  } catch (err) {
    next(err);
  }
}

// GET /api/packages/admin/all  (admin — all including inactive)
async function getAllPackagesAdmin(req, res, next) {
  try {
    const packages = await Package.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json(packages);
  } catch (err) {
    next(err);
  }
}

// GET /api/packages/:id  (public)
async function getPackageById(req, res, next) {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!pkg) return res.status(404).json({ message: 'Package not found.' });
    res.json(pkg);
  } catch (err) {
    next(err);
  }
}

// POST /api/packages  (admin)
async function createPackage(req, res, next) {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    next(err);
  }
}

// PUT /api/packages/:id  (admin)
async function updatePackage(req, res, next) {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ message: 'Package not found.' });
    res.json(pkg);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/packages/:id  (admin — soft delete)
async function deletePackage(req, res, next) {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ message: 'Package not found.' });
    res.json({ message: 'Package deactivated.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPackages, getAllPackagesAdmin, getPackageById, createPackage, updatePackage, deletePackage };
