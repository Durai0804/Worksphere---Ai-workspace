const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin, HR)
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, role, page = 1, limit = 10 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (Admin, HR)
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, salary, joiningDate, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const employeeData = {
      name,
      email,
      password: password || 'defaultPassword123',
      role: role || 'employee',
      department,
      phone,
      salary,
      joiningDate,
      status: status || 'active',
    };

    if (req.file) {
      employeeData.avatar = `/uploads/profile-images/${req.file.filename}`;
    }

    const employee = await User.create(employeeData);

    await ActivityLog.create({
      user: req.user._id,
      action: 'Employee created',
      entity: 'employee',
      entityId: employee._id,
      details: `Created employee: ${employee.name} (${employee.department})`,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR)
const updateEmployee = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password update through this route

    if (req.file) {
      updateData.avatar = `/uploads/profile-images/${req.file.filename}`;
    }

    const employee = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'Employee updated',
      entity: 'employee',
      entityId: employee._id,
      details: `Updated employee: ${employee.name}`,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user._id,
      action: 'Employee deleted',
      entity: 'employee',
      entityId: req.params.id,
      details: `Deleted employee: ${employee.name}`,
    });

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department list
// @route   GET /api/employees/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await User.distinct('department');
    res.status(200).json({
      success: true,
      data: departments.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments };
