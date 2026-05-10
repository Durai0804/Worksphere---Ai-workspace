const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Try connecting to configured MongoDB first
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('📦 Starting in-memory MongoDB...');
  }

  // Fallback: use in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
    console.log('⚠️  Data will be lost when server stops. Use MongoDB Atlas for persistence.');
  } catch (memError) {
    console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
    process.exit(1);
  }
};

const getMongoServer = () => mongoServer;

module.exports = connectDB;
module.exports.getMongoServer = getMongoServer;
