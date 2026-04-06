const Review = require('../models/Review');

// GET /api/reviews  (public — only approved)
async function getReviews(req, res, next) {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews  (open to guests and authenticated users)
async function createReview(req, res, next) {
  try {
    const { rating, comment, service, customerName } = req.body;

    // Prevent a logged-in user from submitting twice
    if (req.user) {
      const existing = await Review.findOne({ customer: req.user._id });
      if (existing) {
        return res.status(409).json({ message: 'You have already submitted a review.' });
      }
    }

    const review = await Review.create({
      ...(req.user?._id && { customer: req.user._id }),
      customerName: req.user?.name || customerName,
      rating,
      comment,
      service:      service || null,
      isApproved:   true,
    });

    res.status(201).json({ message: 'Review submitted! It will appear after approval.', review });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id/approve  (admin)
async function approveReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/pending  (admin)
async function getPendingReviews(req, res, next) {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/reviews/:id  (admin)
async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviews, createReview, approveReview, getPendingReviews, deleteReview };
