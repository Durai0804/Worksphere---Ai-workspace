const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./config/logger');

// ── Render compatibility ──────────────────────────────────
// Render sets NODE_ENV via dashboard; fallback for safety
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Parse port as integer base 10 — Render injects this dynamically
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// ── Validate required env vars ────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Create HTTP server (Express + Socket.IO share this) ───
const server = http.createServer(app);
initSocket(server);

// ── Auto-seed demo data ───────────────────────────────────
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

// ── Start server ──────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await seedDemoData();

    // Bind error handler before listen
    server.on('error', (err) => {
      logger.error(`Server error: ${err.message}`);
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

    server.listen(PORT, HOST, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// ── Graceful shutdown ─────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — closing server...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});
