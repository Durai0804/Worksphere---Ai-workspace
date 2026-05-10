const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    // Join role-based room
    socket.on('joinRole', (role) => {
      socket.join(`role-${role}`);
      console.log(`👥 User joined role room: role-${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
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
