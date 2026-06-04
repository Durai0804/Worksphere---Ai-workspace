const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// ── Compression ────────────────────────────────────────────
app.use(compression());

// ── Security headers ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:", "cdn.jsdelivr.net", "*"],
      mediaSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    },
  },
}));

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

// ── Rate limiting ─────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// ── Static files ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Workplace OS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ── Serve React production build ───────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Error handler ─────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
