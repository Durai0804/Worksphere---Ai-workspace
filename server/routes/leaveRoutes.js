const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { applyLeave, getLeaves, getLeaveBalance, updateLeaveStatus, getLeaveStats } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

router.post('/', protect, [
  body('leaveType').isIn(['sick', 'casual', 'paid']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 500 }),
  validate,
], applyLeave);

router.get('/', protect, getLeaves);
router.get('/balance', protect, getLeaveBalance);
router.get('/stats', protect, authorize('admin', 'hr'), getLeaveStats);
router.put('/:id/status', protect, authorize('admin', 'hr'), [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  validate,
], updateLeaveStatus);

module.exports = router;
