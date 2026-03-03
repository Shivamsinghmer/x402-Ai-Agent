# Open x402 — The Decentralized AI Agent Marketplace

> Access specialized intelligence and on-chain tools secured by the **x402 payment-gated protocol** on Sepolia testnet. A premium, full-stack marketplace for autonomous AI agents.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │ RainbowKit│  │  Wagmi   │  │   Viem    │  │   Axios   │  │
│  │ (Wallet)  │  │ (Hooks)  │  │(Tx Build) │  │ (HTTP)    │  │
│  └─────┬─────┘  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  │
│        └──────────────┴──────────────┴──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + x-wallet-address header
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                      │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐     │
│  │  Middleware   │  │  Routes     │  │  Services        │     │
│  │  paymentReq'd │→│ /verify     │  │  paymentService  │     │
│  │  rateLimiter  │  │ /agent/query│  │  apiService      │     │
│  └──────────────┘  └────────────┘  │  llmService       │     │
│                                     └──────────────────┘     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │ MongoDB  │  │ Ethers.js    │  │  External APIs   │       │
│  │(Payments)│  │(On-chain     │  │  Amadeus Travel  │       │
│  │          │  │ verification)│  │  CoinMarketCap   │       │
│  │          │  │              │  │  Groq LLM        │       │
│  └──────────┘  └──────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 x402 Protocol Flow (The Payment Layer)

1. **User Request**: User sends a query to a specific AI Agent.
2. **Payment Check**: Backend checks if the wallet has a valid, unused payment for that agent.
3. **402 Required**: If not paid, server returns a `402 Payment Required` with the recipient address.
4. **Autonomous Pay**: User confirms, and the frontend signs a transaction to the Agent's vault.
5. **Verification**: Backend verifies the transaction on-chain (Sepolia) and releases the AI response.

---

## ✨ Marketplace Agents

| Agent | Capability | Price |
|-------|------------|-------|
| **ChainMind** | Real-time cross-chain intelligence & market analysis. | 0.001 ETH |
| **HotelBooking** | Search & book hotels globally via Amadeus API. | 0.002 ETH |

---

## 📂 Folder Structure

```
open-x402/
├── backend/          # Express.js Server
│   ├── src/agents/   # Modular Agent Handlers
│   ├── src/services/ # Amadeus, Payment, LLM services
│   └── src/routes/   # Auth & Payment API
└── frontend/         # React + Tailwind Dashboard
    ├── src/hooks/    # useChat (Autonomous Payment Logic)
    └── src/marketplace/ # Agent Cards & Booking UI
```

---

## 🚀 Setup & Launch

### Prerequisites
- Node.js v18+
- MongoDB
- Groq API Key
- Amadeus API Credentials (for HotelBooking)

### 1. Installation
```bash
# Clone and install dependencies
git clone https://github.com/your-repo/open-x402
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables
Create `.env` in the `backend` folder:
```env
AGENT_WALLET_ADDRESS=0x...
GROQ_API_KEY=...
AMADEUS_API_KEY=...
AMADEUS_API_SECRET=...
MONGODB_URI=...
SEPOLIA_RPC_URL=...
```

### 3. Run Locally
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🔐 Security & Protocol
- **On-chain Validation**: Real-time verification of Tx hashes via `ethers.js`.
- **Private Key Isolation**: Agent keys are never exposed to the frontend.
- **Glassmorphism Design**: High-fidelity interface for a premium Web3 experience.

---

## 📜 License
MIT
