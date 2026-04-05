const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      trim: true,
      default: null,
    },
    tag: {
      type: String,
      trim: true,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ date: -1 });

module.exports = mongoose.model('Event', eventSchema);
