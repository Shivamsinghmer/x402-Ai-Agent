// ============================================================
// x402 AI Agent — MongoDB Connection
// ============================================================
// Uses Mongoose to connect to MongoDB. Called once at startup.
// ============================================================

import mongoose from "mongoose";
import config from "../config/index.js";

/**
 * Establish connection to MongoDB.
 * Mongoose handles reconnection automatically.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌  MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
