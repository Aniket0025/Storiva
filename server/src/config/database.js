import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connect to MongoDB Atlas / Local Database
 */
const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;