const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      },
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      default: 'absent',
    },
    workHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + date uniqueness
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate work hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut.getTime() - this.checkIn.getTime();
    this.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
