const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Validate required env vars
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const server = http.createServer(app);

initSocket(server);

const seedDemoData = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count > 0) return;

  logger.info('Auto-seeding demo data...');
  const users = [
    { name: 'Admin User', email: 'admin@workplace.com', password: 'admin123', role: 'admin', department: 'Management', phone: '+1234567890', salary: 120000, status: 'active' },
    { name: 'HR Manager', email: 'hr@workplace.com', password: 'hr123456', role: 'hr', department: 'Human Resources', phone: '+1234567891', salary: 85000, status: 'active' },
    { name: 'John Smith', email: 'john@workplace.com', password: 'emp12345', role: 'employee', department: 'Engineering', phone: '+1234567892', salary: 75000, status: 'active' },
  ];

  for (const u of users) {
    await User.create(u);
  }
  logger.info('Seeded 3 demo users (admin@workplace.com / admin123)');
};

const startServer = async () => {
  try {
    await connectDB();
    await seedDemoData();

    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

