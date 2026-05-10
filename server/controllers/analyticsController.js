const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const ActivityLog = require('../models/ActivityLog');

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalEmployees = await User.countDocuments({ status: 'active' });
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter(a => ['present', 'late'].includes(a.status)).length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Department distribution
    const deptDist = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Attendance trend (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAttendance = await Attendance.aggregate([
      { $match: { date: { $gte: weekAgo, $lte: today } } },
      { $group: { _id: '$date', present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } }, absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    // Recent activity
    const recentActivity = await ActivityLog.find().populate('user', 'name avatar').sort({ createdAt: -1 }).limit(10);

    // Leave stats
    const leaveStats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        presentToday,
        absentToday: totalEmployees - presentToday,
        lateToday,
        pendingLeaves,
        departmentDistribution: deptDist,
        attendanceTrend: weekAttendance,
        recentActivity,
        leaveStats
      }
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats };
