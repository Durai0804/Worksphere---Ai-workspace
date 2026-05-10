const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const user = await User.findById(req.user._id);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (user.leaveBalance[leaveType] < totalDays) {
      return res.status(400).json({ success: false, message: `Insufficient ${leaveType} leave balance` });
    }

    const leave = await Leave.create({ user: req.user._id, leaveType, startDate: start, endDate: end, reason });

    const managers = await User.find({ role: { $in: ['admin', 'hr'] } });
    for (const mgr of managers) {
      await Notification.create({ recipient: mgr._id, sender: req.user._id, type: 'leave-request', title: 'New Leave Request', message: `${user.name} requested ${totalDays} day(s) of ${leaveType} leave`, link: '/leaves' });
    }

    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

const getLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    let query = {};
    if (req.user.role === 'employee') query.user = req.user._id;
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query).populate('user', 'name email department avatar').populate('approvedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.status(200).json({ success: true, data: leaves, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

const getLeaveBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user.leaveBalance });
  } catch (error) { next(error); }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Not found' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    if (comments) leave.comments = comments;
    await leave.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(leave.user, { $inc: { [`leaveBalance.${leave.leaveType}`]: -leave.totalDays } });
    }

    await Notification.create({ recipient: leave.user, sender: req.user._id, type: status === 'approved' ? 'leave-approved' : 'leave-rejected', title: `Leave ${status}`, message: `Your ${leave.leaveType} leave has been ${status}`, link: '/leaves' });

    res.status(200).json({ success: true, data: leave });
  } catch (error) { next(error); }
};

const getLeaveStats = async (req, res, next) => {
  try {
    const pending = await Leave.countDocuments({ status: 'pending' });
    const approved = await Leave.countDocuments({ status: 'approved' });
    const rejected = await Leave.countDocuments({ status: 'rejected' });
    const byType = await Leave.aggregate([{ $group: { _id: '$leaveType', count: { $sum: 1 } } }]);
    res.status(200).json({ success: true, data: { pending, approved, rejected, total: pending + approved + rejected, byType } });
  } catch (error) { next(error); }
};

module.exports = { applyLeave, getLeaves, getLeaveBalance, updateLeaveStatus, getLeaveStats };
