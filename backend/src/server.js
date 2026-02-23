import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();

app.use(
    cors({
        origin: [config.frontendUrl, "http://localhost:5173"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "x-wallet-address"],
    })
);

app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,                  
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests. Please try again later.",
    },
});
app.use(limiter);

const paymentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 10,                  
    message: {
        status: "error",
        message: "Too many payment verification attempts. Slow down.",
    },
});

app.use("/api", paymentRoutes);
app.use("/api", agentRoutes);

app.use("/api/verify-payment", paymentLimiter);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "x402-ai-agent",
        network: "Sepolia Testnet",
        timestamp: new Date().toISOString(),
    });
});

const start = async () => {
    await connectDB();

    app.listen(config.port, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║           x402 AI Agent — Backend                ║
╠══════════════════════════════════════════════════╣
║  🚀  Server:     http://localhost:${config.port}          ║
║  🔗  Network:    Sepolia Testnet                 ║
║  💰  Agent Wallet:                               ║
║      ${config.agentWalletAddress}  ║
║  💵  Required:   ${config.requiredPaymentEth} ETH                      ║
╚══════════════════════════════════════════════════╝
    `);
    });
};

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
