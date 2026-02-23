// ============================================================
// x402 AI Agent — Wagmi + RainbowKit Configuration
// ============================================================
// Sets up wallet connection for Sepolia testnet using
// Wagmi v2 + RainbowKit.
//
// NOTE: RainbowKit's getDefaultConfig requires a valid
// WalletConnect Cloud projectId. Get one FREE at:
//   https://cloud.walletconnect.com
//
// For local development, we use a community test projectId.
// Replace it with your own for production.
// ============================================================

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { http } from "wagmi";

/**
 * Wagmi configuration with RainbowKit defaults.
 * Uses Sepolia testnet exclusively.
 *
 * The projectId below is WalletConnect's public demo key.
 * It works for development/testing but should be replaced
 * with your own from https://cloud.walletconnect.com
 */
const wagmiConfig = getDefaultConfig({
    appName: "x402 AI Agent",
    // WalletConnect Cloud project ID
    // Get your own FREE at: https://cloud.walletconnect.com
    projectId: "21fef48091f12692cad574a6f7753643",
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
    ssr: false,
});

export default wagmiConfig;
