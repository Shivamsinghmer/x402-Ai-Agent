# ChainMind AI — Intelligence Oracle

> A premium, full-stack AI Analyst implementing the **x402 payment-gated protocol** on Sepolia testnet. Users access real-time cross-chain intelligence, market analytics, and gas optimization (Ethereum & Solana) via a professional high-fidelity interface.

---

## 📺 Demo

[![Demo Video](https://img.youtube.com/vi/KtPnthA_sxw/0.jpg)](https://youtu.be/KtPnthA_sxw)

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
│  │(Payments)│  │(On-chain     │  │  CoinMarketCap   │       │
│  │          │  │ verification)│  │  Etherscan Gas   │       │
│  │          │  │              │  │  Groq LLM        │       │
│  └──────────┘  └──────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 x402 Protocol Flow

```
User visits site
    │
    ▼
Connect MetaMask (Sepolia)
    │
    ▼
Analyze Market Intelligence
    │
    ▼
Frontend sends POST /api/agent/query
  with header: x-wallet-address: 0x...
    │
    ▼
Backend checks: Has this wallet paid?
    │
    ├── YES → Fetch Data → LLM → Return Intelligence
    │
    └── NO → Return HTTP 402 Payment Required
              {
                status: "payment_required",
                amount: "0.001 ETH",
                payment_address: "0x...",
                network: "Sepolia Testnet"
              }
              │
              ▼
        Frontend triggers confirmation
              │
              ▼
        User clicks "Confirm & Pay"
              │
              ▼
        MetaMask sends Sepolia ETH
              │
              ▼
        Wait for tx confirmation
              │
              ▼
        POST /api/verify-payment
          { transactionHash, walletAddress }
              │
              ▼
        Backend verifies on-chain:
          ✓ tx exists on Sepolia
          ✓ tx.to == agent wallet (ChainMind Oracle)
          ✓ tx.value >= 0.001 ETH
          ✓ tx matches sender & is unique
              │
              ▼
        Store payment in MongoDB
              │
              ▼
        Re-run original request → AI Response 🎉
```

---

## ✨ Features & UI

| Feature | Description |
|---------|-------------|
| **Command Center** | Persistent left sidebar for quick-glance market data & network vitals. |
| **Market Brief** | Live price feeds for ETH and SOL integrated directly into the dashboard. |
| **Network Vitals** | Real-time Gas tracker (Gwei) and network latency monitoring. |
| **Glassmorphism** | High-fidelity frosted glass message bubbles and UI elements for a premium feel. |
| **Dynamic Orb** | Mathematical WebGL background that responds to user presence and interactions. |
| **Oracle v1.0** | Professional-grade analytical tone focusing on data-driven cross-chain insights. |

---

## 📂 Folder Structure

```
chainmind-ai/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── src/
│       ├── server.js          # Express entry point
│       ├── config/
│       │   ├── index.js       # Centralized config
│       │   └── db.js          # MongoDB connection
│       ├── middleware/
│       │   └── paymentRequired.js  # x402 middleware
│       ├── models/
│       │   └── Payment.js     # Mongoose payment model
│       ├── routes/
│       │   ├── paymentRoutes.js    # /verify-payment, /payment-status
│       │   └── agentRoutes.js      # /agent/query (protected)
│       └── services/
│           ├── paymentService.js   # On-chain TX verification
│           ├── apiService.js       # CoinMarketCap + Etherscan
│           └── llmService.js       # Groq LLM integration
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx           # React entry (providers)
│       ├── index.css          # Global styles (Tailwind v4)
│       ├── config/
│       │   └── wagmi.js       # Wagmi + RainbowKit config (Sepolia)
│       ├── services/
│       │   └── api.js         # Axios API client
│       └── components/
│           ├── ChatPage.jsx   # Core UI (Sidebar + Chat + Glassmorphism)
│           └── Orb.jsx        # WebGL Background effect
│
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Setup

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** running locally (or MongoDB Atlas)
- **MetaMask** browser extension
- **Sepolia ETH** (get from [Alchemy Faucet](https://sepoliafaucet.com))

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# Your wallet that will RECEIVE payments
AGENT_WALLET_ADDRESS=0xYourWalletAddressHere

# Get at https://coinmarketcap.com/api/
COINMARKETCAP_API_KEY=your_key

# Get at https://etherscan.io/apis
ETHERSCAN_API_KEY=your_key

# Get at https://console.groq.com/
GROQ_API_KEY=your_key

# MongoDB (local or Atlas URI)
MONGODB_URI=mongodb://localhost:27017/chainmind

# Sepolia RPC (default works, or use Alchemy/Infura)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 3. Start MongoDB

```bash
# If using local MongoDB:
mongod
```

### 4. Start Infrastructure

Run the following in separate terminals:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Finalize Setup

1. Open `http://localhost:5173`
2. Connect wallet on **Sepolia Testnet**.
3. Use the **Market Brief** in the sidebar to monitor prices.
4. Issue a query: *"Analyze ETH vs Solana efficiency"*
5. Experience the autonomous analyst in action!

---

## 🔐 Security Notes

- **On-chain Verification**: Backend validates every transaction hash directly against the Sepolia network using `ethers.js`.
- **Duplicate Protection**: Unique transaction hashes prevent re-use of payments.
- **Wallet Matching**: Verifies `tx.from` matches the authenticated wallet address.
- **Zero-Exposure**: API keys and secrets are strictly server-side.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS v4, OGL (WebGL)
- **Web3**: Wagmi, Viem, RainbowKit (Sepolia Only)
- **Backend**: Node.js, Express, Mongoose
- **Intelligence**: Groq API (High-performance LLM)
- **Design**: Frosted Glass UI, Dynamic Sidebar, Interactive WebGL Background

---

## 📜 License

MIT
