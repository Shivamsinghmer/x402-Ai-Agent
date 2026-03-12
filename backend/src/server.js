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
        origin: [
            config.frontendUrl,
            "http://localhost:5173",
            "https://x402-ai-agent.vercel.app"
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "x-wallet-address"],
        credentials: true
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
        service: "chainmind-ai",
        network: "Sepolia Testnet",
        timestamp: new Date().toISOString(),
    });
});

const startServer = async () => {
    try {
        await connectDB();

        if (process.env.NODE_ENV !== "production") {
            app.listen(config.port, () => {
                console.log(`
╔══════════════════════════════════════════════════╗
║           Open x402 AI — Backend                 ║
╠══════════════════════════════════════════════════╣
║  🚀  Server:     http://localhost:${config.port}          ║
║  🔗  Network:    Sepolia Testnet                 ║
║  💰  Agent Wallet:                               ║
║      ${config.agentWalletAddress}  ║
║  💵  Required:   ${config.requiredPaymentEth} ETH                      ║
╚══════════════════════════════════════════════════╝
                `);
            });
        }
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

export default app;

