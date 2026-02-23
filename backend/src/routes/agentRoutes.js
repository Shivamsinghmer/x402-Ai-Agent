// ============================================================
// x402 AI Agent — Agent Routes (Payment-Gated)
// ============================================================
// The main AI agent endpoint, protected by the x402 payment
// middleware. Only wallets that have verified payments can
// access the AI agent's gas optimization analysis.
//
// Flow (PAY-PER-QUERY):
//   1. paymentRequired middleware checks for unused payment credit
//   2. If has credit → fetch real-time data (CoinMarketCap + Etherscan)
//   3. Preprocess data into structured text
//   4. Send to Groq LLM for analysis
//   5. Mark the payment as used (consumed)
//   6. Return AI response to frontend
// ============================================================

import { Router } from "express";
import paymentRequired from "../middleware/paymentRequired.js";
import {
    getEthPrice,
    getGasPrices,
    preprocessDataForLLM,
} from "../services/apiService.js";
import { getGasOptimizationAdvice } from "../services/llmService.js";
import { markPaymentUsed } from "../services/paymentService.js";

const router = Router();

/**
 * POST /api/agent/query
 *
 * Protected by x402 payment middleware.
 * Processes the user's gas optimization query through the
 * full data pipeline: APIs → Preprocessing → LLM.
 *
 * Body: { query: string }
 * Header: x-wallet-address: 0x...
 */
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

        // ── Step 1: Fetch real-time data in parallel ─────────────
        console.log("📡 Fetching real-time ETH price and gas data...");
        const [ethPrice, gasPrices] = await Promise.all([
            getEthPrice(),
            getGasPrices(),
        ]);

        // ── Step 2: Preprocess data for the LLM ──────────────────
        console.log("⚙️  Preprocessing data for LLM...");
        const preprocessedData = preprocessDataForLLM(ethPrice, gasPrices);
        console.log("\n" + preprocessedData + "\n");

        // ── Step 3: Send to LLM for analysis ─────────────────────
        console.log("🧠 Sending to Groq LLM for analysis...");
        const aiResponse = await getGasOptimizationAdvice(
            preprocessedData,
            query
        );

        // ── Step 4: Mark payment as used (pay-per-query) ────────
        console.log("💳 Consuming payment credit...");
        await markPaymentUsed(req.walletAddress);

        // ── Step 5: Return the full response ─────────────────────
        return res.status(200).json({
            status: "success",
            data: {
                // Raw data (for frontend display)
                ethPrice: {
                    usd: ethPrice.price.toFixed(2),
                    change24h: ethPrice.percentChange24h?.toFixed(2),
                },
                gasPrices: {
                    safe: gasPrices.safeGasPrice,
                    standard: gasPrices.proposeGasPrice,
                    fast: gasPrices.fastGasPrice,
                    baseFee: gasPrices.suggestBaseFee,
                },
                // AI analysis
                aiAnalysis: aiResponse,
                // Metadata
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
