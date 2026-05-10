const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedUsers = [
  { name: 'Admin User', email: 'admin@workplace.com', password: 'admin123', role: 'admin', department: 'Management', phone: '+1234567890', salary: 120000, status: 'active' },
  { name: 'HR Manager', email: 'hr@workplace.com', password: 'hr123456', role: 'hr', department: 'Human Resources', phone: '+1234567891', salary: 85000, status: 'active' },
  { name: 'John Smith', email: 'john@workplace.com', password: 'emp12345', role: 'employee', department: 'Engineering', phone: '+1234567892', salary: 75000, status: 'active' },
  { name: 'Sarah Johnson', email: 'sarah@workplace.com', password: 'emp12345', role: 'employee', department: 'Design', phone: '+1234567893', salary: 70000, status: 'active' },
  { name: 'Mike Wilson', email: 'mike@workplace.com', password: 'emp12345', role: 'employee', department: 'Engineering', phone: '+1234567894', salary: 72000, status: 'active' },
  { name: 'Emily Davis', email: 'emily@workplace.com', password: 'emp12345', role: 'employee', department: 'Marketing', phone: '+1234567895', salary: 68000, status: 'active' },
  { name: 'David Brown', email: 'david@workplace.com', password: 'emp12345', role: 'employee', department: 'Finance', phone: '+1234567896', salary: 78000, status: 'active' },
  { name: 'Lisa Anderson', email: 'lisa@workplace.com', password: 'emp12345', role: 'employee', department: 'Engineering', phone: '+1234567897', salary: 76000, status: 'active' },
  { name: 'Chris Martinez', email: 'chris@workplace.com', password: 'emp12345', role: 'employee', department: 'Design', phone: '+1234567898', salary: 65000, status: 'active' },
  { name: 'Amy Taylor', email: 'amy@workplace.com', password: 'emp12345', role: 'employee', department: 'Human Resources', phone: '+1234567899', salary: 62000, status: 'active' },
];

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
    
    for (const userData of seedUsers) {
      await User.create(userData);
    }
    
    console.log('✅ Seeded', seedUsers.length, 'users');
    console.log('\n📧 Login credentials:');
    console.log('  Admin: admin@workplace.com / admin123');
    console.log('  HR:    hr@workplace.com / hr123456');
    console.log('  Emp:   john@workplace.com / emp12345');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
