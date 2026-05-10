const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entity: {
      type: String,
      enum: ['user', 'employee', 'attendance', 'leave', 'notification', 'system'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
