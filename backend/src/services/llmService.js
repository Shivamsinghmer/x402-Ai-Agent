// ============================================================
// x402 AI Agent — LLM Service (Groq)
// ============================================================
// Uses the Groq API with gpt-oss-120b to generate expert-level
// gas optimization advice based on real-time network data.
//
// The model acts as a blockchain gas optimization expert and
// provides structured, actionable recommendations.
// ============================================================

import Groq from "groq-sdk";
import config from "../config/index.js";

// ── Initialize Groq client ──────────────────────────────────
const groq = new Groq({ apiKey: config.groqApiKey });

/**
 * System prompt that establishes the AI agent's persona and
 * output format. This is critical for consistent responses.
 */
const SYSTEM_PROMPT = `You are a blockchain gas optimization and crypto market expert. Analyze real-time Ethereum gas and price data, then give clear, actionable advice.

STRICT FORMATTING RULES:
- DO NOT use markdown tables. Never use | or table syntax.
- Use short bullet points (•) and bold (**text**) to highlight key numbers.
- Keep each section to 3-5 bullet points max.
- Write like you're texting a friend who understands crypto — casual, direct, no fluff.
- Always show costs in both ETH and USD.

RESPONSE STRUCTURE — Use these exact headings:

## 💰 ETH Price Analysis
Current price, 24h trend, and short market sentiment. Is it a good time to buy?

## 🏪 Cheapest Platform to Buy ETH
Compare these platforms and recommend the cheapest for buying ETH right now:
• **CEXs**: Binance (0.1% fee), Coinbase (0.6% fee), Kraken (0.26% fee), OKX (0.1% fee), Bybit (0.1% fee)
• **DEXs**: Uniswap (0.3% pool fee + gas), 1inch (aggregator, best rate), CoW Swap (MEV-protected, gasless)
Factor in gas costs for DEXs vs flat fees on CEXs. Give a clear winner.

## 🔍 Network Status
2-3 sentences summarizing current gas and congestion. Mention key numbers.

## 💡 Cheapest Strategy
3-5 bullet points on how to get the cheapest transaction right now. Be specific with gas settings.

## ⏰ Best Time to Transact
When are gas fees lowest? Give specific UTC time windows and days.

## 🚀 Layer 2 Options
List 3 L2s with their approximate cost for a simple transfer. One line each.

## 📊 Bottom Line
One short paragraph with your final recommendation. What should the user do RIGHT NOW?`;

/**
 * Send preprocessed network data to the Groq LLM and get back
 * a structured gas optimization analysis.
 *
 * @param {string} preprocessedData – Structured text from apiService.preprocessDataForLLM()
 * @param {string} userQuery        – The user's original question
 * @returns {string}                – The AI agent's analysis
 */
export const getGasOptimizationAdvice = async (
    preprocessedData,
    userQuery
) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: `USER QUERY: "${userQuery}"

HERE IS THE REAL-TIME ETHEREUM NETWORK DATA:

${preprocessedData}

Give me a clean, simple analysis. Use bullet points, NOT tables. Keep it short and direct.`,
                },
            ],
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.9,
            stream: false,
        });

        // Extract the response text
        const response = chatCompletion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("Empty response from Groq API");
        }

        return response;
    } catch (error) {
        console.error("Groq LLM error:", error.message);
        throw new Error(`LLM analysis failed: ${error.message}`);
    }
};
