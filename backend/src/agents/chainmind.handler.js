import { getGasOptimizationAdvice } from "../services/llmService.js";
import {
    getEthPrice,
    getSolPrice,
    getGasPrices,
    preprocessDataForLLM,
} from "../services/apiService.js";

/**
 * ChainMind AI Handler
 * Real-time ETH and Solana market data, gas prices, network congestion.
 */
export const chainmindHandler = async ({ query }) => {
    console.log("📡 [ChainMind] Fetching real-time market data...");
    const [ethPrice, solPrice, gasPrices] = await Promise.all([
        getEthPrice(),
        getSolPrice(),
        getGasPrices(),
    ]);

    console.log("⚙️  [ChainMind] Preprocessing data for LLM...");
    const preprocessedData = preprocessDataForLLM(ethPrice, solPrice, gasPrices);

    console.log("🧠 [ChainMind] Sending to LLM for analysis...");
    const aiResponse = await getGasOptimizationAdvice(
        preprocessedData,
        query
    );

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

    return {
        result: aiResponse,
        metadata: dataPayload
    };
};
