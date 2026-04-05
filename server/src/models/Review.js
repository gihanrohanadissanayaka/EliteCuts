const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    service: {
      type: String,
      trim: true,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false, // admin must approve before public display
    },
  },
  { timestamps: true }
);

// One review per authenticated customer (sparse so null guest values are excluded)
reviewSchema.index({ customer: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
