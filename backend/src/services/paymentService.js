// ============================================================
// x402 AI Agent — Payment Service
// ============================================================
// Handles all payment-related logic (PAY-PER-QUERY model):
//   • Check if a wallet has an unused payment credit
//   • Verify a transaction on-chain via ethers.js
//   • Persist verified payments to MongoDB
//   • Mark payments as used after a query completes
//
// SECURITY NOTE:
//   We NEVER trust the frontend's claim that a payment was made.
//   Every tx hash is verified on-chain against the Sepolia RPC.
// ============================================================

import { ethers } from "ethers";
import Payment from "../models/Payment.js";
import config from "../config/index.js";

// ── Sepolia JSON-RPC provider ───────────────────────────────
const provider = new ethers.JsonRpcProvider(config.sepoliaRpcUrl);

/**
 * Check whether a wallet has an UNUSED payment credit.
 * In pay-per-query model, each payment is consumed after one query.
 * @param {string} walletAddress – The user's Ethereum address.
 * @returns {boolean} – true if the wallet has an unused payment.
 */
export const hasUnusedPayment = async (walletAddress) => {
    const payment = await Payment.findOne({
        walletAddress: walletAddress.toLowerCase(),
        verified: true,
        used: false,  // Only count unused payments
    });
    return !!payment;
};

/**
 * Mark the oldest unused payment for a wallet as consumed.
 * Called after a query is successfully processed.
 * @param {string} walletAddress – The user's Ethereum address.
 * @returns {boolean} – true if a payment was marked as used.
 */
export const markPaymentUsed = async (walletAddress) => {
    const payment = await Payment.findOneAndUpdate(
        {
            walletAddress: walletAddress.toLowerCase(),
            verified: true,
            used: false,
        },
        { used: true },
        { sort: { createdAt: 1 } } // Use oldest unused payment first
    );
    return !!payment;
};

/**
 * Verify a transaction on-chain, confirm it meets our criteria,
 * and persist it to MongoDB.
 *
 * Checks performed:
 *   1. Transaction exists on Sepolia
 *   2. tx.to matches our agent wallet
 *   3. tx.value >= required payment amount
 *   4. Transaction has been mined (has a receipt)
 *   5. Transaction hasn't been used before (no duplicates)
 *
 * @param {string} txHash – The Sepolia transaction hash.
 * @param {string} senderAddress – The wallet that claims to have paid.
 * @returns {{ success: boolean, message: string, payment?: object }}
 */
export const verifyTransaction = async (txHash, senderAddress) => {
    try {
        // ── 1. Check for duplicate ────────────────────────────────
        const existing = await Payment.findOne({ transactionHash: txHash });
        if (existing) {
            return {
                success: false,
                message: "This transaction has already been used for payment.",
            };
        }

        // ── 2. Fetch transaction from Sepolia ─────────────────────
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            return {
                success: false,
                message:
                    "Transaction not found on Sepolia. It may still be pending — try again in a few seconds.",
            };
        }

        // ── 3. Verify tx.to matches our agent wallet ──────────────
        if (
            tx.to?.toLowerCase() !== config.agentWalletAddress.toLowerCase()
        ) {
            return {
                success: false,
                message: `Transaction recipient (${tx.to}) does not match agent wallet.`,
            };
        }

        // ── 4. Verify tx.value >= required amount ─────────────────
        const requiredWei = ethers.parseEther(config.requiredPaymentEth);
        if (tx.value < requiredWei) {
            return {
                success: false,
                message: `Insufficient payment. Required: ${config.requiredPaymentEth} Sepolia ETH, received: ${ethers.formatEther(tx.value)} Sepolia ETH.`,
            };
        }

        // ── 5. Ensure the transaction has been mined ──────────────
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            return {
                success: false,
                message: "Transaction has not been mined yet. Please wait and retry.",
            };
        }

        if (receipt.status === 0) {
            return {
                success: false,
                message: "Transaction was reverted on-chain.",
            };
        }

        // ── 6. Verify the sender matches ─────────────────────────
        if (tx.from?.toLowerCase() !== senderAddress.toLowerCase()) {
            return {
                success: false,
                message: "Transaction sender does not match the provided wallet address.",
            };
        }

        // ── 7. Persist to MongoDB ─────────────────────────────────
        const payment = await Payment.create({
            walletAddress: senderAddress.toLowerCase(),
            transactionHash: txHash,
            amountEth: ethers.formatEther(tx.value),
            amountWei: tx.value.toString(),
            blockNumber: receipt.blockNumber,
            verified: true,
        });

        return {
            success: true,
            message: "Payment verified successfully ✅",
            payment,
        };
    } catch (error) {
        console.error("Payment verification error:", error);
        return {
            success: false,
            message: `Verification failed: ${error.message}`,
        };
    }
};
