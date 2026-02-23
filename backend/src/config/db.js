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
    // If already connected, don't re-connect
    if (mongoose.connection.readyState >= 1) return;

    try {
        const conn = await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
        });
        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌  MongoDB connection error: ${error.message}`);
    }
};



export default connectDB;
