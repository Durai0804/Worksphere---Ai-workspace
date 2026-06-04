const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '..', 'logs');

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'info' : 'debug';
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) return `${timestamp} ${level}: ${message}\n${stack}`;
    return `${timestamp} ${level}: ${message}`;
  })
);

const transports = [];

// Always add console transport (Render works best with stdout logging)
transports.push(new winston.transports.Console({
  format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
}));

// Add file transports only if the logs directory exists/writable
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.accessSync(logDir, fs.constants.W_OK);
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    })
  );
} catch {
  // File system not writable (e.g., Render ephemeral) — skip file logging
}

const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
});

logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
