import { Router } from "express";
import { verifyTransaction, hasUnusedPayment } from "../services/paymentService.js";
import { executeAutoPay, getAgentWalletInfo } from "../services/autoPayService.js";
import Payment from "../models/Payment.js";
import { agentRegistry } from "../agents/agentRegistry.js";
import config from "../config/index.js";

const router = Router();

router.post("/verify-payment", async (req, res) => {
    try {
        const { transactionHash, walletAddress } = req.body;
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

        console.log(`🔍 Verifying tx: ${transactionHash} from ${walletAddress}`);

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

// ── Agent Auto-Pay ──────────────────────────────────────────
router.post("/agent-auto-pay", async (req, res) => {
    try {
        const { walletAddress, agentId } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                status: "error",
                message: "walletAddress is required.",
            });
        }

        // ── Determine Amount ────────────────────────────────────
        let amountEth = req.body.amountEth || config.requiredPaymentEth;

        if (!req.body.amountEth && agentId) {
            const agent = agentRegistry.find(a => a.id === agentId);
            if (agent) {
                amountEth = agent.price;
            }
        }

        console.log(`🤖 Agent auto-pay initiated for user: ${walletAddress} (Amount: ${amountEth} ETH, Agent: ${agentId || 'default'})`);

        // ── Step 1: Execute the on-chain payment ────────────────
        const payResult = await executeAutoPay(undefined, amountEth);

        if (!payResult.success) {
            return res.status(500).json({
                status: "auto_pay_failed",
                message: payResult.error,
            });
        }

        // ── Step 2: Create payment credit for the USER ──────────
        const payment = await Payment.create({
            walletAddress: walletAddress.toLowerCase(),
            transactionHash: payResult.transactionHash,
            amountEth: payResult.amountEth,
            amountWei: (parseFloat(payResult.amountEth) * 1e18).toString(),
            blockNumber: payResult.blockNumber,
            verified: true,
            used: false,
        });

        if (!payment) {
            return res.status(500).json({
                status: "credit_failed",
                message: "Payment was sent but could not be credited.",
                transactionHash: payResult.transactionHash,
            });
        }

        console.log(`✅ Auto-pay complete: ${payResult.transactionHash}`);

        return res.status(200).json({
            status: "auto_pay_success",
            message: "Agent paid and verified automatically ✅",
            payment: {
                transactionHash: payResult.transactionHash,
                from: payResult.from,
                to: payResult.to,
                amountEth: payResult.amountEth,
                blockNumber: payResult.blockNumber,
                creditedTo: walletAddress,
            },
        });
    } catch (error) {
        console.error("Agent auto-pay error:", error);
        return res.status(500).json({
            status: "error",
            message: `Auto-pay failed: ${error.message}`,
        });
    }
});

// ── Agent Wallet Info ────────────────────────────────────────
router.get("/agent-wallet-info", async (req, res) => {
    try {
        const info = await getAgentWalletInfo();
        return res.status(200).json({
            status: "success",
            wallet: info,
        });
    } catch (error) {
        console.error("Wallet info error:", error);
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

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
