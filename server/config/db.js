const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      ...(process.env.NODE_ENV === 'production' ? {} : {}),
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

