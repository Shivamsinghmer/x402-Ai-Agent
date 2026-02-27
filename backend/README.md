# ChainMind AI — Backend

The intelligence engine for **ChainMind AI**, responsible for cross-chain analysis, transaction verification, and x402 protocol enforcement.

## 🚀 Features

- **x402 Middleware**: Robust payment gating that requires a valid transaction for AI access.
- **Cross-Chain Analytics**: Real-time data aggregation from Etherscan and CoinMarketCap.
- **Intelligence Core**: High-performance LLM integration via the Groq SDK.
- **On-Chain Verification**: Direct verification of Sepolia transactions using `ethers.js`.
- **Payment Lifecycle**: Secure storage and tracking of verified payments in MongoDB.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Blockchain**: Ethers.js
- **Intelligence**: Groq API

## 🏃 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in your API keys and configuration.
    ```bash
    cp .env.example .env
    ```

3.  **Start Server**:
    ```bash
    npm run dev
    ```

## 📌 API Endpoints

- `GET /api/health`: Service health check.
- `GET /api/payment-status`: Check payment status for a specific wallet.
- `POST /api/verify-payment`: Verify a new on-chain transaction.
- `POST /api/agent/query`: Process AI intelligence requests (x402 protected).

---
Part of the **ChainMind AI** ecosystem.
