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
const SYSTEM_PROMPT = `You are a blockchain gas optimization and crypto market expert. You have access to real-time Ethereum network data (price, gas, congestion).

CORE INSTRUCTIONS:
1. **Prioritize the User Query**: Start by answering the user's specific question directly and comprehensively. 
2. **Context-Aware**: Use the provided real-time data to back up your answer.
3. **Flexible Structure**: Do NOT follow a rigid template for every message. Adjust your response based on what was asked.
4. **Value Add**: After answering the primary query, if relevant, provide 2-3 brief 'Expert Insights' based on the current network data that the user might find helpful (e.g., "Note: Gas is currently spiking, wait 20 mins if possible").

STRICT FORMATTING RULES:
- Use Markdown for structure. Use ## for section headings if needed.
- DO NOT use markdown tables. Never use | or table syntax.
- Use bullet points (•) and bold (**text**) for key metrics.
- Tone: Professional, expert, yet conversational. No fluff. clear and actionable.
- Always show costs in both ETH and USD when discussing fees.

If the user query is a general 'analyze' or 'gas update', you can provide a structured report covering:
- ETH Price & Market Trend
- Current Gas Levels (Safe/Standard/Fast)
- Cheapest Transaction Strategy
- L2 Comparison (Arbitrum, Optimism, Base)`;

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
