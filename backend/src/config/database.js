const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn(
        "MONGODB_URI not found in environment variables. Database features will be disabled."
      );
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.warn(
      "Continuing without database connection. Authentication features will be limited."
    );
    // Don't exit the process, just continue without DB
  }
};

module.exports = connectDB;
