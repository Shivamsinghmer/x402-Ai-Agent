import { Router } from "express";
import paymentRequired from "../middleware/paymentRequired.js";
import Chat from "../models/Chat.js";
import {
    getEthPrice,
    getSolPrice,
    getGasPrices,
    preprocessDataForLLM,
} from "../services/apiService.js";
import { getGasOptimizationAdvice } from "../services/llmService.js";
import { markPaymentUsed } from "../services/paymentService.js";
import { agentRouter } from "../agents/agentRouter.js";
import { agentRegistry } from "../agents/agentRegistry.js";

const router = Router();

router.get("/agent/history/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { agentId } = req.query; // Optional filter by agentId

        let filter = { walletAddress: walletAddress.toLowerCase() };
        if (agentId) {
            if (agentId === "chainmind") {
                filter.$or = [
                    { agentId: "chainmind" },
                    { agentId: { $exists: false } },
                    { agentId: null }
                ];
            } else {
                filter.agentId = agentId;
            }
        }

        const history = await Chat.find(filter)
            .select("title messages agentId createdAt updatedAt")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            status: "success",
            data: history,
        });
    } catch (error) {
        console.error("History fetch error:", error);
        return res.status(500).json({
            status: "error",
            message: `Failed to fetch chat history: ${error.message}`,
        });
    }
});

// Marketplace Registry — Get all available agents
router.get("/agents/registry", (req, res) => {
    // Return all agents minus the 'handler' function field for the frontend
    const publicRegistry = agentRegistry.map(({ handler, ...rest }) => rest);
    res.json({
        status: "success",
        data: publicRegistry,
    });
});

// Multi-Agent Marketplace Query Route
router.post("/agent/:agentId/query", agentRouter);

// Single chat route with persistence
router.post("/agent/query", paymentRequired, async (req, res) => {
    try {
        const { query, chatId } = req.body;
        const walletAddress = req.walletAddress.toLowerCase();

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a query for the AI agent.",
            });
        }

        console.log(`🤖 Processing query from ${walletAddress}: "${query}"`);

        // Get or Create Chat Session
        let chat;
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, walletAddress });
        }

        if (!chat) {
            chat = new Chat({
                walletAddress,
                title: query.substring(0, 40) + (query.length > 40 ? "..." : ""),
                messages: [],
            });
        }

        // Add user message
        chat.messages.push({ role: "user", content: query });

        console.log("📡 Fetching real-time market data (ETH, SOL, Gas)...");
        const [ethPrice, solPrice, gasPrices] = await Promise.all([
            getEthPrice(),
            getSolPrice(),
            getGasPrices(),
        ]);

        console.log("⚙️  Preprocessing data for LLM...");
        const preprocessedData = preprocessDataForLLM(ethPrice, solPrice, gasPrices);
        console.log("🧠 Sending to Groq LLM for analysis...");
        const aiResponse = await getGasOptimizationAdvice(
            preprocessedData,
            query
        );

        console.log("💳 Consuming payment credit...");
        await markPaymentUsed(walletAddress);

        const dataPayload = {
            ethPrice: {
                usd: ethPrice.price.toFixed(2),
                change24h: ethPrice.percentChange24h?.toFixed(2),
            },
            solPrice: {
                usd: solPrice.price.toFixed(2),
                change24h: solPrice.percentChange24h?.toFixed(2),
            },
            gasPrices: {
                safe: gasPrices.safeGasPrice,
                standard: gasPrices.proposeGasPrice,
                fast: gasPrices.fastGasPrice,
                baseFee: gasPrices.suggestBaseFee,
            },
            aiAnalysis: aiResponse,
            timestamp: new Date().toISOString(),
            model: "gpt-oss-120b",
            provider: "Groq",
        };

        // Add assistant message and save
        chat.messages.push({
            role: "assistant",
            content: aiResponse,
            data: dataPayload
        });

        await chat.save();

        return res.status(200).json({
            status: "success",
            chatId: chat._id,
            data: dataPayload,
        });
    } catch (error) {
        console.error("Agent query error:", error);
        return res.status(500).json({
            status: "error",
            message: `Failed to process query: ${error.message}`,
        });
    }
});

export default router;
