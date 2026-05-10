const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already checked in today
    let attendance = await Attendance.findOne({ user: userId, date: today });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const checkInTime = now;
    // Determine status: late if after 9:30 AM
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 30, 0, 0);
    const status = checkInTime > lateThreshold ? 'late' : 'present';

    if (attendance) {
      attendance.checkIn = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        user: userId,
        date: today,
        checkIn: checkInTime,
        status,
      });
    }

    await ActivityLog.create({
      user: userId,
      action: 'Checked in',
      entity: 'attendance',
      entityId: attendance._id,
      details: `Check-in at ${checkInTime.toLocaleTimeString()} - Status: ${status}`,
    });

    res.status(200).json({
      success: true,
      data: attendance,
      message: `Checked in successfully${status === 'late' ? ' (Late)' : ''}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in today',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
      });
    }

    attendance.checkOut = now;
    await attendance.save();

    await ActivityLog.create({
      user: userId,
      action: 'Checked out',
      entity: 'attendance',
      entityId: attendance._id,
      details: `Check-out at ${now.toLocaleTimeString()} - Work hours: ${attendance.workHours}`,
    });

    res.status(200).json({
      success: true,
      data: attendance,
      message: `Checked out successfully. Work hours: ${attendance.workHours}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for a user
// @route   GET /api/attendance/history
// @access  Private
const getAttendanceHistory = async (req, res, next) => {
  try {
    const { month, year, userId } = req.query;
    const targetUserId = userId || req.user._id;

    // Only admin/HR can view other users' attendance
    if (userId && userId !== req.user._id.toString() && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other users\' attendance',
      });
    }

    let query = { user: targetUserId };

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('user', 'name email department');

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance for today (admin view)
// @route   GET /api/attendance/all-today
// @access  Private (Admin, HR)
const getAllTodayAttendance = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await Attendance.find({ date: today })
      .populate('user', 'name email department avatar role');

    const totalEmployees = await User.countDocuments({ status: 'active' });
    const presentCount = attendance.filter((a) => ['present', 'late'].includes(a.status)).length;
    const lateCount = attendance.filter((a) => a.status === 'late').length;
    const absentCount = totalEmployees - presentCount;

    res.status(200).json({
      success: true,
      data: {
        attendance,
        stats: {
          total: totalEmployees,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly summary
// @route   GET /api/attendance/monthly-summary
// @access  Private
const getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const userId = req.query.userId || req.user._id;

    const attendance = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const summary = {
      totalDays: endDate.getDate(),
      present: attendance.filter((a) => a.status === 'present').length,
      absent: 0,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      onLeave: attendance.filter((a) => a.status === 'on-leave').length,
      totalWorkHours: attendance.reduce((sum, a) => sum + (a.workHours || 0), 0),
      avgWorkHours: 0,
    };

    const workingDays = summary.totalDays - 8; // approx weekends
    summary.absent = workingDays - summary.present - summary.late - summary.halfDay - summary.onLeave;
    if (summary.absent < 0) summary.absent = 0;
    const totalPresent = summary.present + summary.late;
    summary.avgWorkHours = totalPresent > 0 ? parseFloat((summary.totalWorkHours / totalPresent).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllTodayAttendance,
  getMonthlySummary,
};
