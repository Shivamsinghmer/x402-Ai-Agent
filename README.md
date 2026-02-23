# x402 AI Agent — Payment-Gated Gas Optimization

> A full-stack AI Agent system implementing the **x402-style payment-gated protocol** on Sepolia testnet. Users pay 0.001 ETH to access real-time gas optimization advice powered by gpt-oss-120b.

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
│  └──────────┘  └──────────────┘  │  Groq LLM        │       │
│                                   └──────────────────┘       │
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
User asks gas optimization question
    │
    ▼
Frontend sends POST /api/agent/query
  with header: x-wallet-address: 0x...
    │
    ▼
Backend checks: Has this wallet paid?
    │
    ├── YES → Fetch data → LLM → Return AI response
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
        Frontend detects 402
              │
              ▼
        User clicks "Pay 0.001 ETH"
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
          ✓ tx.to == agent wallet
          ✓ tx.value >= 0.001 ETH
          ✓ tx is mined (not reverted)
          ✓ sender matches
          ✓ not duplicate
              │
              ▼
        Store payment in MongoDB
              │
              ▼
        Re-run original query → AI response
```

---

## 📂 Folder Structure

```
x402aiagent/
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
│       ├── App.jsx            # Layout
│       ├── index.css          # Global styles
│       ├── App.css            # App layout styles
│       ├── config/
│       │   └── wagmi.js       # Wagmi + RainbowKit config
│       ├── services/
│       │   └── api.js         # Axios API client
│       └── components/
│           ├── Header.jsx     # Nav + ConnectButton
│           ├── Header.css
│           ├── ChatPanel.jsx  # Main interaction (x402 flow)
│           ├── ChatPanel.css
│           ├── Footer.jsx
│           └── Footer.css
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
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com))

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
MONGODB_URI=mongodb://localhost:27017/x402agent

# Sepolia RPC (default works, or use Alchemy/Infura)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 3. Start MongoDB

```bash
# If using local MongoDB:
mongod
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅  MongoDB connected: localhost
╔══════════════════════════════════════════════════╗
║           x402 AI Agent — Backend                ║
║  🚀  Server: http://localhost:5000               ║
║  🔗  Network: Sepolia Testnet                    ║
╚══════════════════════════════════════════════════╝
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Opens at `http://localhost:5173`

### 6. Test the Flow

1. Open `http://localhost:5173` in your browser
2. Click **Connect Wallet** → connect MetaMask on Sepolia
3. Click **⚡ Analyze Gas**
4. You'll see the **402 Payment Required** card
5. Click **💰 Pay 0.001 ETH**
6. Confirm in MetaMask
7. Wait for verification
8. See the AI gas optimization analysis! 🎉

---

## 🔐 Security Notes

| Concern | Implementation |
|---------|---------------|
| Payment fraud | Backend verifies every tx on-chain via ethers.js |
| Duplicate tx | Transaction hashes are stored and checked for uniqueness |
| Sender spoofing | Backend verifies tx.from matches the claimed wallet |
| API key exposure | All keys are server-side only, never sent to frontend |
| Rate limiting | General (100/15min) + payment-specific (10/5min) limits |
| CORS | Locked to frontend origin only |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Wagmi, Viem, RainbowKit |
| Wallet | MetaMask, Sepolia Testnet |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Blockchain | Ethers.js (on-chain verification) |
| APIs | CoinMarketCap, Etherscan Gas Oracle |
| LLM | Groq API (gpt-oss-120b) |
| Styling | Vanilla CSS (glassmorphism + dark theme) |

---

## 📌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | Health check |
| `GET` | `/api/payment-status?walletAddress=0x...` | — | Check if wallet has paid |
| `POST` | `/api/verify-payment` | — | Verify tx on-chain |
| `POST` | `/api/agent/query` | x402 | Ask the AI agent (payment-gated) |

---

## 📜 License

MIT
