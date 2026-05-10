const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/departments', protect, getDepartments);
router.get('/', protect, authorize('admin', 'hr'), getEmployees);
router.get('/:id', protect, getEmployee);
router.post('/', protect, authorize('admin', 'hr'), upload.single('avatar'), createEmployee);
router.put('/:id', protect, authorize('admin', 'hr'), upload.single('avatar'), updateEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
