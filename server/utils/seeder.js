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
