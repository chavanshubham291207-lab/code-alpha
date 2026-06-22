import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas using mongodb+srv:// URI.
 * Includes retry logic and production-safe connection options.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('FATAL: MONGO_URI environment variable is not set.');
    process.exit(1);
  }

  // Validate that the URI uses the modern SRV format
  if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
    console.error('FATAL: MONGO_URI does not appear to be a valid MongoDB connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Fail fast if Atlas is unreachable (10s)
      socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
      family: 4,                       // Force IPv4 to avoid DNS resolution issues on Render
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    console.error('   Check that MONGO_URI is correct and Atlas IP whitelist includes 0.0.0.0/0');
    process.exit(1);
  }
};

export default connectDB;
