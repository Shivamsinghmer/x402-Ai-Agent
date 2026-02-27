// ============================================================
// x402 AI Agent — Auto-Pay Service
// ============================================================
// Signs and broadcasts an ETH payment transaction using the
// agent's own private key. This removes the MetaMask step —
// the agent autonomously pays the toll for each query.
//
// FLOW:
//   1. Create a wallet from AGENT_PRIVATE_KEY
//   2. Build a tx sending requiredPaymentEth to the receiver
//   3. Sign + broadcast via Sepolia RPC
//   4. Wait for confirmation
//   5. Return the tx hash for downstream verification
// ============================================================

import { ethers } from "ethers";
import config from "../config/index.js";

// ── Provider + Wallet ───────────────────────────────────────
const provider = new ethers.JsonRpcProvider(config.sepoliaRpcUrl);

/**
 * Create a signer wallet from the agent's private key.
 * Throws if AGENT_PRIVATE_KEY is not configured.
 */
const getAgentWallet = () => {
    if (!config.agentPrivateKey) {
        throw new Error(
            "AGENT_PRIVATE_KEY is not configured. Cannot auto-pay."
        );
    }
    return new ethers.Wallet(config.agentPrivateKey, provider);
};

/**
 * Execute an autonomous payment from the agent's wallet.
 *
 * @param {string} recipientAddress – Where to send the ETH (defaults to paymentReceiverAddress)
 * @param {string} amountEth       – Amount in ETH to send (defaults to requiredPaymentEth)
 * @returns {{ success: boolean, transactionHash?: string, from?: string, to?: string, amountEth?: string, error?: string }}
 */
export const executeAutoPay = async (
    recipientAddress = config.paymentReceiverAddress || config.agentWalletAddress,
    amountEth = config.requiredPaymentEth
) => {
    try {
        const wallet = getAgentWallet();
        const from = wallet.address;

        console.log(`🤖 Auto-pay: ${from} → ${recipientAddress} (${amountEth} Sepolia ETH)`);

        // ── Check balance ───────────────────────────────────────
        const balance = await provider.getBalance(from);
        const requiredWei = ethers.parseEther(amountEth);

        // Add a buffer for gas costs (~0.001 ETH should be plenty on Sepolia)
        const gasBuffer = ethers.parseEther("0.0005");
        if (balance < requiredWei + gasBuffer) {
            const balEth = ethers.formatEther(balance);
            return {
                success: false,
                error: `Insufficient agent wallet balance. Have: ${balEth} ETH, need: ${amountEth} ETH + gas.`,
            };
        }

        // ── Build + send transaction ────────────────────────────
        const tx = await wallet.sendTransaction({
            to: recipientAddress,
            value: requiredWei,
        });

        console.log(`📤 Auto-pay tx sent: ${tx.hash}`);

        // ── Wait for 1 confirmation ─────────────────────────────
        const receipt = await tx.wait(1);

        if (receipt.status === 0) {
            return {
                success: false,
                error: "Auto-pay transaction was reverted on-chain.",
                transactionHash: tx.hash,
            };
        }

        console.log(`✅ Auto-pay confirmed in block ${receipt.blockNumber}`);

        return {
            success: true,
            transactionHash: tx.hash,
            from,
            to: recipientAddress,
            amountEth,
            blockNumber: receipt.blockNumber,
        };
    } catch (error) {
        console.error("❌ Auto-pay error:", error.message);
        return {
            success: false,
            error: `Auto-pay failed: ${error.message}`,
        };
    }
};

/**
 * Get the agent wallet's current balance.
 * Useful for the frontend to show remaining funds.
 *
 * @returns {{ address: string, balanceEth: string, balanceWei: string }}
 */
export const getAgentWalletInfo = async () => {
    const wallet = getAgentWallet();
    const balance = await provider.getBalance(wallet.address);

    return {
        address: wallet.address,
        balanceEth: ethers.formatEther(balance),
        balanceWei: balance.toString(),
    };
};
