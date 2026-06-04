const { Server } = require('socket.io');
const logger = require('./logger');

let io;

const initSocket = (server) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(userId);
      logger.debug(`User ${userId} joined room`);
    });

    socket.on('joinRole', (role) => {
      socket.join(`role-${role}`);
      logger.debug(`User joined role room: role-${role}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
