const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).populate('sender', 'name avatar').sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
