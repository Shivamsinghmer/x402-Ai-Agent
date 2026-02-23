// ============================================================
// x402 AI Agent — Backend Configuration
// ============================================================
// Centralizes all environment variable access so the rest of
// the codebase never reads process.env directly.
// ============================================================

import dotenv from "dotenv";
dotenv.config();

const config = {
  // ── Server ────────────────────────────────────────────────
  port: process.env.PORT || 5000,

  // ── MongoDB ───────────────────────────────────────────────
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/x402agent",

  // ── Agent Wallet ──────────────────────────────────────────
  // The wallet that receives the 0.001 ETH toll payment
  agentWalletAddress: process.env.AGENT_WALLET_ADDRESS,

  // ── Payment ───────────────────────────────────────────────
  // Amount in ETH the user must pay before accessing the AI
  requiredPaymentEth: process.env.REQUIRED_PAYMENT_ETH || "0.001",

  // ── Sepolia RPC ───────────────────────────────────────────
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",

  // ── CoinMarketCap ─────────────────────────────────────────
  coinMarketCapApiKey: process.env.COINMARKETCAP_API_KEY,

  // ── Etherscan ─────────────────────────────────────────────
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,

  // ── Groq LLM ──────────────────────────────────────────────
  groqApiKey: process.env.GROQ_API_KEY,

  // ── CORS ──────────────────────────────────────────────────
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

// ── Validation ──────────────────────────────────────────────
// Fail fast if critical env vars are missing
const required = [
  "agentWalletAddress",
  "coinMarketCapApiKey",
  "etherscanApiKey",
  "groqApiKey",
];

for (const key of required) {
  if (!config[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
    // Do not process.exit(1) in production/Vercel as it kills the function
  }
}


export default config;
