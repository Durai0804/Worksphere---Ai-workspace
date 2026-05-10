const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { getMongoServer } = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Auto-seed demo data for in-memory mode
const seedDemoData = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count > 0) return; // Already seeded

  console.log('🌱 Auto-seeding demo data...');
  const users = [
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

  for (const u of users) {
    await User.create(u);
  }
  console.log('✅ Seeded 10 demo users');
  console.log('📧 Login: admin@workplace.com / admin123');
};

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if using in-memory DB or empty database
    await seedDemoData();

    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

