// ============================================================
// x402 AI Agent — API Client (Axios)
// ============================================================
// Centralized API client that:
//   • Points at the backend
//   • Automatically attaches the wallet address header
//   • Handles 402 responses
// ============================================================

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Create an Axios instance pre-configured for the backend.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60s timeout — LLM calls can be slow
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Query the AI agent. Attaches the wallet address header.
 * @param {string} query – The user's question
 * @param {string} walletAddress – Connected wallet address  
 * @returns {Promise<object>} – The API response (may be 402)
 */
export const queryAgent = async (query, walletAddress) => {
    try {
        const response = await api.post(
            "/agent/query",
            { query },
            {
                headers: { "x-wallet-address": walletAddress },
            }
        );
        return response.data;
    } catch (error) {
        // Rethrow so the component can handle 402 specifically
        if (error.response) {
            throw error;
        }
        throw new Error("Network error — is the backend running?");
    }
};

/**
 * Verify a payment transaction on-chain.
 * @param {string} transactionHash – The Sepolia tx hash
 * @param {string} walletAddress – The sender's address
 * @returns {Promise<object>}
 */
export const verifyPayment = async (transactionHash, walletAddress) => {
    const response = await api.post("/verify-payment", {
        transactionHash,
        walletAddress,
    });
    return response.data;
};

/**
 * Check if a wallet has already paid.
 * @param {string} walletAddress
 * @returns {Promise<boolean>}
 */
export const checkPaymentStatus = async (walletAddress) => {
    const response = await api.get("/payment-status", {
        params: { walletAddress },
    });
    return response.data.hasPaid;
};

/**
 * Trigger the backend to auto-pay from the agent's own wallet.
 * No MetaMask interaction needed — the agent signs the tx server-side.
 * @param {string} walletAddress – The user's wallet address to credit
 * @returns {Promise<object>} – { status, message, payment }
 */
export const agentAutoPay = async (walletAddress) => {
    try {
        const response = await api.post("/agent-auto-pay", { walletAddress });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error;
        }
        throw new Error("Network error — is the backend running?");
    }
};

/**
 * Get the agent wallet's balance and address.
 * @returns {Promise<{ address: string, balanceEth: string }>}
 */
export const getAgentWalletInfo = async () => {
    const response = await api.get("/agent-wallet-info");
    return response.data.wallet;
};

export default api;
