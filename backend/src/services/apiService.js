
import axios from "axios";
import config from "../config/index.js";

/**
 * Fetch the current ETH price in USD from CoinMarketCap.
 * @returns {{ price: number, percentChange24h: number, marketCap: number, volume24h: number }}
 */
export const getEthPrice = async () => {
    try {
        const response = await axios.get(
            "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
            {
                params: { symbol: "ETH", convert: "USD" },
                headers: {
                    "X-CMC_PRO_API_KEY": config.coinMarketCapApiKey,
                    Accept: "application/json",
                },
            }
        );

        const ethData = response.data.data.ETH;
        const quote = ethData.quote.USD;

        return {
            price: quote.price,
            percentChange1h: quote.percent_change_1h,
            percentChange24h: quote.percent_change_24h,
            percentChange7d: quote.percent_change_7d,
            marketCap: quote.market_cap,
            volume24h: quote.volume_24h,
        };
    } catch (error) {
        console.error("CoinMarketCap API error:", error.message);
        throw new Error("Failed to fetch ETH price from CoinMarketCap.");
    }
};

/**
 * Fetch current Ethereum gas prices from Etherscan Gas Oracle.
 * Returns SafeGasPrice, ProposeGasPrice, and FastGasPrice.
 * @returns {{ safeGasPrice: string, proposeGasPrice: string, fastGasPrice: string, suggestBaseFee: string }}
 */
export const getGasPrices = async () => {
    try {
        const response = await axios.get("https://api.etherscan.io/v2/api", {
            params: {
                chainid: 1,           // Ethereum Mainnet for real gas data
                module: "gastracker",
                action: "gasoracle",
                apikey: config.etherscanApiKey,
            },
        });

        if (response.data.status !== "1") {
            throw new Error(
                `Etherscan API returned status ${response.data.status}: ${response.data.message}`
            );
        }

        const result = response.data.result;

        return {
            safeGasPrice: result.SafeGasPrice,       // Low priority (Gwei)
            proposeGasPrice: result.ProposeGasPrice, // Average priority (Gwei)
            fastGasPrice: result.FastGasPrice,       // High priority (Gwei)
            suggestBaseFee: result.suggestBaseFee,   // Current base fee
            gasUsedRatio: result.gasUsedRatio,       // Block utilization ratios
        };
    } catch (error) {
        console.error("Etherscan Gas Oracle error:", error.message);
        throw new Error("Failed to fetch gas prices from Etherscan.");
    }
};

/**
 * Preprocesses raw API data into a clean, structured text block
 * that the LLM can reason over effectively.
 *
 * This is a critical step — raw JSON confuses LLMs.
 * Structured text yields better reasoning.
 *
 * @param {object} ethPrice  – from getEthPrice()
 * @param {object} gasPrices – from getGasPrices()
 * @returns {string}         – formatted context string
 */
export const preprocessDataForLLM = (ethPrice, gasPrices) => {
    // ── Calculate gas costs in USD ──────────────────────────────
    // Standard ETH transfer uses 21,000 gas
    const gasUnits = 21000;

    const safeCostGwei = parseFloat(gasPrices.safeGasPrice);
    const proposeCostGwei = parseFloat(gasPrices.proposeGasPrice);
    const fastCostGwei = parseFloat(gasPrices.fastGasPrice);

    const safeCostEth = (safeCostGwei * gasUnits) / 1e9;
    const proposeCostEth = (proposeCostGwei * gasUnits) / 1e9;
    const fastCostEth = (fastCostGwei * gasUnits) / 1e9;

    const safeCostUsd = (safeCostEth * ethPrice.price).toFixed(4);
    const proposeCostUsd = (proposeCostEth * ethPrice.price).toFixed(4);
    const fastCostUsd = (fastCostEth * ethPrice.price).toFixed(4);

    // ── Determine congestion level ─────────────────────────────
    let congestionLevel = "Low";
    if (proposeCostGwei > 50) congestionLevel = "High";
    else if (proposeCostGwei > 20) congestionLevel = "Moderate";

    // ── Build structured text ──────────────────────────────────
    return `
═══════════════════════════════════════════════════
  ETHEREUM NETWORK STATUS — REAL-TIME DATA
═══════════════════════════════════════════════════

📊 ETH MARKET DATA:
  • Current Price: $${ethPrice.price.toFixed(2)} USD
  • 1h Change:  ${ethPrice.percentChange1h?.toFixed(2)}%
  • 24h Change: ${ethPrice.percentChange24h?.toFixed(2)}%
  • 7d Change:  ${ethPrice.percentChange7d?.toFixed(2)}%
  • Market Cap: $${(ethPrice.marketCap / 1e9).toFixed(2)}B
  • 24h Volume: $${(ethPrice.volume24h / 1e9).toFixed(2)}B

⛽ GAS PRICES (Gwei):
  • 🟢 Safe (Low Priority):    ${gasPrices.safeGasPrice} Gwei → ~$${safeCostUsd} per transfer
  • 🟡 Proposed (Standard):    ${gasPrices.proposeGasPrice} Gwei → ~$${proposeCostUsd} per transfer
  • 🔴 Fast (High Priority):   ${gasPrices.fastGasPrice} Gwei → ~$${fastCostUsd} per transfer
  • Base Fee:                  ${gasPrices.suggestBaseFee || "N/A"} Gwei

🚦 NETWORK CONGESTION: ${congestionLevel}
  • Gas Used Ratio: ${gasPrices.gasUsedRatio || "N/A"}

💰 COST BREAKDOWN (Standard 21,000 gas transfer):
  • Cheapest: ${safeCostEth.toFixed(6)} ETH ($${safeCostUsd})
  • Standard: ${proposeCostEth.toFixed(6)} ETH ($${proposeCostUsd})
  • Fastest:  ${fastCostEth.toFixed(6)} ETH ($${fastCostUsd})

═══════════════════════════════════════════════════
  `.trim();
};
