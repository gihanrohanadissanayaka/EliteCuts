const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    guestName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: null,
    },
    guestPhone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    pinHash: {
      type: String,
      default: null,
    },
    packageName: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to prevent double-booking the same slot
appointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: false });
// Index for fast user queries (sparse so null customer values are excluded)
appointmentSchema.index({ customer: 1, date: -1 }, { sparse: true });
// Index for fast guest phone lookups
appointmentSchema.index({ guestPhone: 1, date: -1 }, { sparse: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
