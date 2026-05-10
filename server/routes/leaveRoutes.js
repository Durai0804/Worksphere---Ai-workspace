const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, getLeaveBalance, updateLeaveStatus, getLeaveStats } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, applyLeave);
router.get('/', protect, getLeaves);
router.get('/balance', protect, getLeaveBalance);
router.get('/stats', protect, authorize('admin', 'hr'), getLeaveStats);
router.put('/:id/status', protect, authorize('admin', 'hr'), updateLeaveStatus);

module.exports = router;
