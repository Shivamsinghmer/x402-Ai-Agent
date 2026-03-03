import { getAgentById } from "./agentRegistry.js";
import Chat from "../models/Chat.js";
import { markPaymentUsed, hasUnusedPayment } from "../services/paymentService.js";
import { ethers } from "ethers";

/**
 * Agent Router Middleware
 * Handles checking payments and routing queries to the correct agent handler.
 */
export const agentRouter = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { query, chatId } = req.body;
        const walletAddress = req.headers["x-wallet-address"]?.toLowerCase();

        if (!walletAddress) {
            return res.status(400).json({
                status: "error",
                message: "Missing x-wallet-address header."
            });
        }

        const agent = getAgentById(agentId);
        if (!agent) {
            return res.status(404).json({
                status: "error",
                message: `Agent '${agentId}' not found.`
            });
        }

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a query for the AI agent."
            });
        }

        // ── 1. Check x402 payment for this specific agent's price ────
        const hasCredit = await hasUnusedPayment(walletAddress, agent.price);

        if (!hasCredit) {
            return res.status(402).json({
                status: "payment_required",
                message: `This query for ${agent.name} requires a payment of ${agent.price} ETH.`,
                agentId: agent.id,
                amount: `${agent.price} ETH`,
                amountWei: ethers.parseEther(agent.price).toString(),
                network: "Sepolia Testnet"
            });
        }

        console.log(`🤖 [Router] Routing to ${agent.id} handler for ${walletAddress}`);

        // ── 2. Get or Create Chat Session ────────────────────────────
        let chat;
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, walletAddress });
        }
        if (!chat) {
            chat = new Chat({
                walletAddress,
                agentId: agent.id,
                title: query.substring(0, 40) + (query.length > 40 ? "..." : ""),
                messages: []
            });
        }

        // Add user message
        chat.messages.push({ role: "user", content: query });

        // ── 3. Call Agent Handler ───────────────────────────────────
        const { result, metadata } = await agent.handler({ query, agentId });

        // ── 4. Consume Payment ──────────────────────────────────────
        await markPaymentUsed(walletAddress, agent.price);

        // ── 5. Save & Return ────────────────────────────────────────
        chat.messages.push({
            role: "assistant",
            content: result,
            data: metadata
        });

        await chat.save();

        return res.status(200).json({
            status: "success",
            chatId: chat._id,
            data: {
                aiAnalysis: result,
                ...metadata
            }
        });

    } catch (error) {
        console.error("Agent Router Error:", error);
        return res.status(500).json({
            status: "error",
            message: `Failed to process agent query: ${error.message}`
        });
    }
};
