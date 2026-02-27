import { Router } from "express";
import paymentRequired from "../middleware/paymentRequired.js";
import {
    getEthPrice,
    getSolPrice,
    getGasPrices,
    preprocessDataForLLM,
} from "../services/apiService.js";
import { getGasOptimizationAdvice } from "../services/llmService.js";
import { markPaymentUsed } from "../services/paymentService.js";

const router = Router();

router.post("/agent/query", paymentRequired, async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a query for the AI agent.",
            });
        }

        console.log(`🤖 Processing query from ${req.walletAddress}: "${query}"`);

        console.log("📡 Fetching real-time market data (ETH, SOL, Gas)...");
        const [ethPrice, solPrice, gasPrices] = await Promise.all([
            getEthPrice(),
            getSolPrice(),
            getGasPrices(),
        ]);

        console.log("⚙️  Preprocessing data for LLM...");
        const preprocessedData = preprocessDataForLLM(ethPrice, solPrice, gasPrices);
        console.log("\n" + preprocessedData + "\n");
        console.log("🧠 Sending to Groq LLM for analysis...");
        const aiResponse = await getGasOptimizationAdvice(
            preprocessedData,
            query
        );

        console.log("💳 Consuming payment credit...");
        await markPaymentUsed(req.walletAddress);

        return res.status(200).json({
            status: "success",
            data: {
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
            },
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
