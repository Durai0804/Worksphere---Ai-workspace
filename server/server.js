const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./config/logger');

// ── Render compatibility ──────────────────────────────────
// Render sets NODE_ENV explicitly; respect it, but default to production
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

// ── Validate required env vars ────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Create HTTP server (Express + Socket.IO share this) ───
const server = http.createServer(app);
initSocket(server);

// ── Listen FIRST, connect to DB second ────────────────────
// This ensures Render's port scanner immediately sees an open port,
// even before the database connection completes.
server.listen(PORT, HOST);

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
  console.log(`Listening on ${bind} (NODE_ENV=${process.env.NODE_ENV})`);
  logger.info(`Server running in ${process.env.NODE_ENV} mode on ${bind}`);

  // ── Connect to MongoDB (non-blocking) ─────────────────
  connectDB()
    .then(() => seedDemoData())
    .catch((err) => {
      logger.error('Failed to connect to database:', err);
    });
});

server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// ── Auto-seed demo data ───────────────────────────────────
const seedDemoData = async () => {
  try {
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
  } catch (err) {
    logger.error('Seeding error:', err);
  }
};

// ── Graceful shutdown ─────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — closing server...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  logger.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logger.error('Uncaught Exception:', err);
});
