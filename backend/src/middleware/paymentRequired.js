// ============================================================
// x402 AI Agent — Payment Required Middleware
// ============================================================
// This is the core x402 protocol middleware.
//
// HOW IT WORKS (PAY-PER-QUERY):
//   1. Extract the wallet address from the request header
//   2. Check MongoDB for an UNUSED payment credit
//   3. If has unused credit → next() (proceed to the route)
//   4. If NO unused credit → 402 Payment Required
//
// This implements the x402 pattern where the server tells the
// client exactly how much to pay and where to send it, similar
// to HTTP 401 returning auth challenge details.
// ============================================================

import { hasUnusedPayment } from "../services/paymentService.js";
import config from "../config/index.js";

/**
 * Express middleware that gates routes behind a payment wall.
 * Attach to any route that requires a payment.
 *
 * Expects header: x-wallet-address
 */
const paymentRequired = async (req, res, next) => {
    try {
        // ── Extract wallet address ────────────────────────────────
        const walletAddress = req.headers["x-wallet-address"];

        if (!walletAddress) {
            return res.status(400).json({
                status: "error",
                message:
                    "Missing x-wallet-address header. Connect your wallet first.",
            });
        }

        // ── Validate Ethereum address format ──────────────────────
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Ethereum address format.",
            });
        }

        // ── Check if wallet has an unused payment credit ─────────
        const hasCredit = await hasUnusedPayment(walletAddress);

        if (hasCredit) {
            // Wallet has an unused payment → allow access
            req.walletAddress = walletAddress;
            return next();
        }

        // ── 402 Payment Required ──────────────────────────────────
        // No unused credits → return payment instructions
        // Each query requires a fresh 0.001 ETH payment
        return res.status(402).json({
            status: "payment_required",
            message:
                "Each query requires a payment of 0.001 ETH. Send ETH to the address below.",
            amount: `${config.requiredPaymentEth} ETH`,
            amountWei: (
                parseFloat(config.requiredPaymentEth) * 1e18
            ).toString(),
            payment_address: config.agentWalletAddress,
            network: "Sepolia Testnet",
            chainId: 11155111,
            instructions: [
                "1. Send the specified amount to the payment address",
                "2. Wait for transaction confirmation",
                "3. Call /api/verify-payment with the transaction hash",
                "4. Access the AI agent endpoint again",
            ],
        });
    } catch (error) {
        console.error("Payment middleware error:", error);
        return res.status(500).json({
            status: "error",
            message: `Payment verification failed: ${error.message}`,
            suggestion: "Check your MONGODB_URI and ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas."
        });

    }
};

export default paymentRequired;
