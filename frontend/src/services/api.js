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
 * Query a specific AI agent. Attaches the wallet address header.
 * @param {string} agentId – The slug of the agent to query (e.g. "chainmind", "hotel-booking")
 * @param {string} query – The user's question
 * @param {string} walletAddress – Connected wallet address  
 * @param {string} chatId - Optional chat ID for persistence
 * @returns {Promise<object>} – The API response (may be 402)
 */
export const queryAgent = async (agentId, query, walletAddress, chatId = null) => {
    try {
        // Handle legacy calls or default to chainmind if agentId looks like a query
        const effectiveAgentId = (agentId && !query && !walletAddress) ? "chainmind" : agentId;
        const effectiveQuery = (agentId && !query && !walletAddress) ? agentId : query;
        const effectiveWallet = (agentId && !query && !walletAddress) ? query : walletAddress;

        const response = await api.post(
            `/agent/${effectiveAgentId}/query`,
            { query: effectiveQuery, chatId },
            {
                headers: { "x-wallet-address": effectiveWallet },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error;
        }
        throw new Error("Network error — is the backend running?");
    }
};

/**
 * Fetch all available agents from the marketplace registry.
 * @returns {Promise<Array>}
 */
export const getAgentsRegistry = async () => {
    try {
        const response = await api.get("/agents/registry");
        return response.data.data;
    } catch (error) {
        console.error("Registry fetch error:", error);
        return [];
    }
};

/**
 * Get History for a specific wallet, optionally filtered by agent.
 * @param {string} walletAddress 
 * @param {string} agentId 
 * @returns {Promise<object>}
 */
export const getChatHistory = async (walletAddress, agentId = null) => {
    try {
        const params = agentId ? { agentId } : {};
        const response = await api.get(`/agent/history/${walletAddress}`, { params });
        return response.data;
    } catch (error) {
        console.error("History error:", error);
        throw error;
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
 * @param {string} agentId – Optional agent ID to get price
 * @param {string} amountEth – Optional custom amount (e.g. for hotel booking)
 * @returns {Promise<object>} – { status, message, payment }
 */
export const agentAutoPay = async (walletAddress, agentId = null, amountEth = null) => {
    try {
        const response = await api.post("/agent-auto-pay", {
            walletAddress,
            agentId,
            amountEth
        });
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

// Removed duplicative helper to keep clean


export default api;
