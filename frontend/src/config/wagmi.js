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
    appName: "ChainMind AI",
    projectId: "21fef48091f12692cad574a6f7753643",
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
    appDescription: "ChainMind AI - Your autonomous cross-chain intelligence oracle",
    appUrl: "https://chainmind-ai.vercel.app",
    appIcon: "https://api.dicebear.com/9.x/bottts/svg?seed=ChainMind",
    ssr: false,
});

export default wagmiConfig;
