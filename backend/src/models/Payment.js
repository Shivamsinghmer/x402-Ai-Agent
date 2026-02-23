// ============================================================
// x402 AI Agent — Payment Model (MongoDB)
// ============================================================
// Stores verified on-chain payments so we never double-charge
// a wallet. Each document represents one successful payment.
// ============================================================

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // The wallet address that sent the payment
        walletAddress: {
            type: String,
            required: true,
            index: true,
            // Store lowercase for case-insensitive lookups
            set: (v) => v.toLowerCase(),
        },

        // The Sepolia transaction hash
        transactionHash: {
            type: String,
            required: true,
            unique: true,
        },

        // Amount paid in ETH (stored as string to avoid float issues)
        amountEth: {
            type: String,
            required: true,
        },

        // Amount paid in Wei (the actual on-chain value)
        amountWei: {
            type: String,
            required: true,
        },

        // Block number where the tx was mined
        blockNumber: {
            type: Number,
            required: true,
        },

        // Whether the payment was verified on-chain
        verified: {
            type: Boolean,
            default: true,
        },

        // Whether this payment has been consumed by a query
        // Each query requires a fresh payment (pay-per-query model)
        used: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // adds createdAt, updatedAt
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
