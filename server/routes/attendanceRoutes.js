const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { checkIn, checkOut, getTodayAttendance, getAttendanceHistory, getAllTodayAttendance, getMonthlySummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, getTodayAttendance);
router.get('/history', protect, getAttendanceHistory);
router.get('/all-today', protect, authorize('admin', 'hr'), getAllTodayAttendance);
router.get('/monthly-summary', protect, getMonthlySummary);

module.exports = router;
