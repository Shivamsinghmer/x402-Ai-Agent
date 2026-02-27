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
const SYSTEM_PROMPT = `You are a multi-chain blockchain expert specializing in Ethereum and Solana. You have access to real-time network data (prices, gas/fees, congestion) for both ecosystems.

CORE INSTRUCTIONS:
1. **Prioritize the User Query**: Start by answering the user's specific question directly and comprehensively, whether it's about Ethereum, Solana, or both.
2. **Context-Aware**: Use the provided real-time data for ETH and SOL to back up your answer.
3. **Multi-Chain Expertise**: 
   • For Ethereum: Discuss gas fees in Gwei and USD, L2 alternatives (Base, Arbitrum, etc.), and congestion.
   • For Solana: Discuss the high-throughput nature, extremely low fees (<$0.01), and current SOL market trends.
4. **Value Add**: After answering the primary query, provide 2-3 brief 'Expert Insights'. If they ask about one chain, maybe mention a relevant comparison or tip for the other if it adds value.

STRICT FORMATTING RULES:
- Use Markdown for structure. Use ## for section headings if needed.
- DO NOT use markdown tables. Never use | or table syntax.
- Use bullet points (•) and bold (**text**) for key metrics.
- Tone: Professional, expert, yet conversational. No fluff.
- Always show costs in both the native token (ETH/SOL) and USD when discussing fees.

If the user query is a general 'analyze' or 'market update', provide a report covering:
- ETH & SOL Price Trends
- Ethereum Gas Levels vs Solana's Low-Fee Advantage
- Cheapest strategy for the requested operation`;

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

HERE IS THE REAL-TIME MULTI-CHAIN NETWORK DATA:

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
