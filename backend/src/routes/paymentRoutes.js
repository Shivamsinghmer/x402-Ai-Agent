// ============================================================
// x402 AI Agent — Payment Routes
// ============================================================
// Endpoints:
//   POST /api/verify-payment  — Verify a Sepolia tx on-chain
//   GET  /api/payment-status  — Check if a wallet has paid
// ============================================================

import { Router } from "express";
import { verifyTransaction, hasUnusedPayment } from "../services/paymentService.js";

const router = Router();

/**
 * POST /api/verify-payment
 *
 * Receives a transaction hash from the frontend and verifies it
 * on-chain using ethers.js. If valid, stores it in MongoDB.
 *
 * Body: { transactionHash: string, walletAddress: string }
 */
router.post("/verify-payment", async (req, res) => {
    try {
        const { transactionHash, walletAddress } = req.body;

        // ── Input validation ────────────────────────────────────
        if (!transactionHash || !walletAddress) {
            return res.status(400).json({
                status: "error",
                message: "transactionHash and walletAddress are required.",
            });
        }

        if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid transaction hash format.",
            });
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid wallet address format.",
            });
        }

        // ── Verify on-chain ─────────────────────────────────────
        console.log(
            `🔍 Verifying tx: ${transactionHash} from ${walletAddress}`
        );

        const result = await verifyTransaction(transactionHash, walletAddress);

        if (result.success) {
            return res.status(200).json({
                status: "payment_verified",
                message: result.message,
                payment: {
                    walletAddress: result.payment.walletAddress,
                    transactionHash: result.payment.transactionHash,
                    amountEth: result.payment.amountEth,
                    blockNumber: result.payment.blockNumber,
                    verifiedAt: result.payment.createdAt,
                },
            });
        } else {
            return res.status(400).json({
                status: "verification_failed",
                message: result.message,
            });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error during payment verification.",
        });
    }
});

/**
 * GET /api/payment-status
 *
 * Quick check to see if a wallet has already paid.
 * Useful for the frontend to restore state on page refresh.
 *
 * Query: ?walletAddress=0x...
 */
router.get("/payment-status", async (req, res) => {
    try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({
                status: "error",
                message: "walletAddress query parameter is required.",
            });
        }

        const hasCredit = await hasUnusedPayment(walletAddress);

        return res.status(200).json({
            status: "success",
            walletAddress,
            hasCredit,
        });
    } catch (error) {
        console.error("Payment status error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error checking payment status.",
        });
    }
});

export default router;
