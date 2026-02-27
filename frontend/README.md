# ChainMind AI — Frontend

This is the React-based frontend for **ChainMind AI**, a premium Intelligence Oracle powered by AI and secured by the x402 payment protocol.

## 🚀 Features

- **Intelligence Oracle Interface**: A professional, data-driven chat interface.
- **Command Center Sidebar**: Persistent view of market analytics (ETH/SOL) and network health.
- **Glassmorphic UI**: High-fidelity frosted glass components and premium typography.
- **Interactive WebGL Background**: A dynamic mathematical orb that responds to user presence.
- **x402 Protocol Integration**: Seamless payment gating via RainbowKit & Wagmi.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Web3**: RainbowKit, Wagmi, Viem
- **Visuals**: OGL (WebGL) for the Orb background, Lucide React for icons.

## 🏃 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Ensure the backend is running at `http://localhost:5000` (default).

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🏗️ Folder Structure

- `/src/components`: Main UI components including `ChatPage` and `Orb`.
- `/src/hooks`: Custom React hooks for theme and chat state.
- `/src/config`: Web3 and API configurations.
- `/src/services`: API client for backend communication.

---
Part of the **ChainMind AI** ecosystem.
