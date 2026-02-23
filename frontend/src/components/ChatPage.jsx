import { ConnectButton } from "@rainbow-me/rainbowkit";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../hooks/useTheme";
import { useChat, STATUS } from "../hooks/useChat";
import { SunIcon, MoonIcon, SendIcon } from "lucide-react";



const SUGGESTIONS = [
    "What's the current ETH gas price and which L2 is cheapest?",
    "Best time to make a transaction today?",
    "Compare gas fees: L1 vs Arbitrum vs Optimism",
];

// ── Sub-components ────────────────────────────────────────────

const Spinner = ({ className }) => (
    <span className={`w-3.5 h-3.5 border-2 border-gray-300 rounded-full animate-spin ${className}`} />
);

const BounceDots = ({ dark }) => (
    <span className="flex gap-1">
        {[0, 150, 300].map((d) => (
            <span key={d} className={`w-2 h-2 ${dark ? "bg-gray-600" : "bg-gray-300"} rounded-full animate-bounce`} style={{ animationDelay: `${d}ms` }} />
        ))}
    </span>
);

const StatusPill = ({ t, children }) => (
    <div className="flex justify-center mb-5 animate-fade-in">
        <div className={`flex items-center gap-2 px-4 py-2.5 text-xs rounded-full border ${t.statusPill}`}>
            {children}
        </div>
    </div>
);

const GasPill = ({ t, color, children }) => {
    const colors = {
        blue: t.pill("bg-blue-50", "text-blue-700", "border-blue-100", "bg-blue-950", "text-blue-300", "border-blue-900"),
        green: t.pill("bg-green-50", "text-green-700", "border-green-100", "bg-green-950", "text-green-300", "border-green-900"),
        amber: t.pill("bg-amber-50", "text-amber-700", "border-amber-100", "bg-amber-950", "text-amber-300", "border-amber-900"),
        red: t.pill("bg-red-50", "text-red-700", "border-red-100", "bg-red-950", "text-red-300", "border-red-900"),
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[color]}`}>
            {children}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────

const ChatPage = () => {
    const { toggle, t } = useTheme();
    const chat = useChat();
    const busy = [STATUS.ANALYZING, STATUS.SENDING_PAYMENT, STATUS.TX_PENDING, STATUS.VERIFYING, STATUS.LOADING].includes(chat.status);

    return (
        <div className={`flex flex-col h-screen ${t.bg} transition-colors duration-300`}>

            {/* ── Header ──────────────────────────────────────────── */}
            <header className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${t.border} ${t.bg} transition-colors duration-300`}>
                <div className="flex items-center gap-2.5">
                    <img
                        src="https://imgs.search.brave.com/Lvr9Mhz7ILTJwG6JcX_Id_w8vpDk3dznBaIt0MGdBYI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/eDQwMi5vcmcvX25l/eHQvaW1hZ2U_dXJs/PS9sb2dvcy9vcGVu/eDQwMi5wbmcmdz0y/NTYmcT03NSZkcGw9/ZHBsXzQ3NWNLRGRx/R004RVJmaWk0eGRp/WGphZ2hBUWY"
                        alt="x402 Logo"
                        className="w-8 h-8 rounded-lg object-contain"
                    />
                    <h1 className={`text-base font-semibold ${t.text}`}>
                        x402 <span className={`${t.textFaint} font-normal`}>AI Agent</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline text-xs ${t.textFaint}`}>0.001 ETH per query</span>
                    <button
                        onClick={toggle}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${t.dark ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        title={t.dark ? "Light mode" : "Dark mode"}
                    >
                        {t.dark ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
                </div>
            </header>

            {/* ── Messages Area ────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

                    {/* Welcome */}
                    {chat.messages.length === 0 && chat.isConnected && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                            <img
                                src="https://imgs.search.brave.com/Lvr9Mhz7ILTJwG6JcX_Id_w8vpDk3dznBaIt0MGdBYI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/eDQwMi5vcmcvX25l/eHQvaW1hZ2U_dXJs/PS9sb2dvcy9vcGVu/eDQwMi5wbmcmdz0y/NTYmcT03NSZkcGw9/ZHBsXzQ3NWNLRGRx/R004RVJmaWk0eGRp/WGphZ2hBUWY"
                                alt="x402 Logo"
                                className="w-16 h-16 rounded-2xl object-contain mb-5"
                            />
                            <h2 className={`text-2xl font-bold ${t.text} mb-2`}>What can I help you with?</h2>
                            <p className={`${t.textMuted} text-sm max-w-md mb-8`}>
                                Ask about ETH gas trends, cheapest transaction strategies, L2 alternatives, or optimal timing. Each query costs 0.001 Sepolia ETH.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTIONS.map((s) => (
                                    <button key={s} onClick={() => chat.setQuery(s)} className={`px-3.5 py-2 text-xs rounded-xl transition-colors cursor-pointer border ${t.chip}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Not connected */}
                    {!chat.isConnected && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                            <div className="text-5xl mb-4">🔐</div>
                            <h2 className={`text-xl font-bold ${t.text} mb-2`}>Connect Your Wallet</h2>
                            <p className={`${t.textMuted} text-sm max-w-sm mb-6`}>
                                Connect MetaMask on Sepolia to start asking the AI agent about gas optimization.
                            </p>
                            <ConnectButton />
                        </div>
                    )}

                    {/* Messages */}
                    {chat.messages.map((msg, i) => (
                        <div key={i} className="mb-5 animate-fade-in">
                            {/* User */}
                            {msg.role === "user" && (
                                <div className="flex justify-end">
                                    <div className={`max-w-[80%] ${t.userBubble} px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed`}>
                                        {msg.content}
                                    </div>
                                </div>
                            )}

                            {/* System */}
                            {msg.role === "system" && (
                                <div className="flex justify-center">
                                    <div className={`px-4 py-2 text-xs ${t.statusPill} rounded-full border`}>
                                        <span className="inline"><ReactMarkdown>{msg.content}</ReactMarkdown></span>
                                    </div>
                                </div>
                            )}

                            {/* Assistant */}
                            {msg.role === "assistant" && (
                                <div className="flex gap-3">
                                    <img
                                        src="https://imgs.search.brave.com/Lvr9Mhz7ILTJwG6JcX_Id_w8vpDk3dznBaIt0MGdBYI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/eDQwMi5vcmcvX25l/eHQvaW1hZ2U_dXJs/PS9sb2dvcy9vcGVu/eDQwMi5wbmcmdz0y/NTYmcT03NSZkcGw9/ZHBsXzQ3NWNLRGRx/R004RVJmaWk0eGRp/WGphZ2hBUWY"
                                        alt="AI"
                                        className="w-7 h-7 rounded-lg object-contain flex-shrink-0 mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                        {msg.data && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <GasPill t={t} color="blue">
                                                    ETH ${msg.data.ethPrice?.usd}
                                                    <span className={`text-[10px] ${parseFloat(msg.data.ethPrice?.change24h) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                        {parseFloat(msg.data.ethPrice?.change24h) >= 0 ? "▲" : "▼"} {msg.data.ethPrice?.change24h}%
                                                    </span>
                                                </GasPill>
                                                <GasPill t={t} color="green">🟢 {msg.data.gasPrices?.safe} Gwei</GasPill>
                                                <GasPill t={t} color="amber">🟡 {msg.data.gasPrices?.standard} Gwei</GasPill>
                                                <GasPill t={t} color="red">🔴 {msg.data.gasPrices?.fast} Gwei</GasPill>
                                            </div>
                                        )}
                                        <div className={`text-sm leading-relaxed ${t.markdown}`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                        {msg.data && (
                                            <div className={`mt-3 text-[10px] ${t.textFaint}`}>
                                                {msg.data.model} • {new Date(msg.data.timestamp).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* ── Status indicators ─────────────────────────────── */}
                    {chat.status === STATUS.PAYMENT_REQUIRED && chat.paymentInfo && (
                        <div className="flex justify-center mb-5 animate-fade-in">
                            <div className={`rounded-2xl px-5 py-4 max-w-md w-full border ${t.dark ? "bg-amber-950 border-amber-800" : "bg-amber-50 border-amber-200"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">💳</span>
                                    <span className={`text-sm font-semibold ${t.dark ? "text-amber-300" : "text-amber-800"}`}>Payment Required</span>
                                </div>
                                <p className={`text-xs mb-3 ${t.dark ? "text-amber-400" : "text-amber-700"}`}>
                                    Send <strong>{chat.paymentInfo.amount}</strong> to access the AI agent.
                                </p>
                                <div className={`text-[10px] font-mono rounded-lg p-2.5 mb-3 break-all ${t.dark ? "bg-amber-900 text-amber-300" : "bg-amber-100 text-amber-600"}`}>
                                    {chat.paymentInfo.payment_address}
                                </div>
                                <button onClick={chat.handlePayment} className="w-full py-2 px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-sm">
                                    💰 Pay {chat.paymentInfo.amount}
                                </button>
                            </div>
                        </div>
                    )}

                    {chat.status === STATUS.SENDING_PAYMENT && (
                        <StatusPill t={t}><Spinner className={t.spinnerAccent} /> Confirm in MetaMask...</StatusPill>
                    )}

                    {chat.status === STATUS.TX_PENDING && (
                        <StatusPill t={t}>
                            <Spinner className={t.spinnerAccent} /> Waiting for Sepolia confirmation...
                            {chat.sendTxData && (
                                <a href={`https://sepolia.etherscan.io/tx/${chat.sendTxData}`} target="_blank" rel="noopener noreferrer" className={`hover:underline ml-1 ${t.dark ? "text-gray-300" : "text-gray-900"}`}>
                                    View ↗
                                </a>
                            )}
                        </StatusPill>
                    )}

                    {chat.status === STATUS.VERIFYING && (
                        <StatusPill t={t}><Spinner className={t.spinnerAccent} /> Verifying on-chain...</StatusPill>
                    )}

                    {(chat.status === STATUS.LOADING || chat.status === STATUS.ANALYZING) && (
                        <div className="flex gap-3 mb-5 animate-fade-in">
                            <img
                                src="https://imgs.search.brave.com/Lvr9Mhz7ILTJwG6JcX_Id_w8vpDk3dznBaIt0MGdBYI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/eDQwMi5vcmcvX25l/eHQvaW1hZ2U_dXJs/PS9sb2dvcy9vcGVu/eDQwMi5wbmcmdz0y/NTYmcT03NSZkcGw9/ZHBsXzQ3NWNLRGRx/R004RVJmaWk0eGRp/WGphZ2hBUWY"
                                alt="AI"
                                className="w-7 h-7 rounded-lg object-contain flex-shrink-0"
                            />
                            <div className={`flex items-center gap-2 text-sm ${t.textFaint}`}>
                                <BounceDots dark={t.dark} />
                                {chat.status === STATUS.ANALYZING ? "Analyzing network data..." : "Thinking..."}
                            </div>
                        </div>
                    )}

                    {chat.status === STATUS.ERROR && chat.error && (
                        <div className="flex justify-center mb-5 animate-fade-in">
                            <div className={`rounded-2xl px-5 py-3 max-w-md border ${t.dark ? "bg-red-950 border-red-800" : "bg-red-50 border-red-200"}`}>
                                <p className={`text-xs ${t.dark ? "text-red-400" : "text-red-600"}`}>❌ {chat.error}</p>
                                <button onClick={chat.dismissError} className={`mt-2 text-xs font-medium cursor-pointer ${t.dark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"}`}>
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    <div ref={chat.messagesEndRef} />
                </div>
            </main>

            {/* ── Input Bar ────────────────────────────────────────── */}
            {chat.isConnected && (
                <div className={`border-t ${t.border} ${t.bg} px-4 sm:px-6 py-3 transition-colors duration-300`}>
                    <form onSubmit={chat.handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
                        <textarea
                            value={chat.query}
                            onChange={(e) => chat.setQuery(e.target.value)}
                            onKeyDown={chat.handleKeyDown}
                            placeholder="Ask about gas trends, cheapest platforms, L2 options..."
                            rows={1}
                            disabled={busy}
                            className={`flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all ${t.inputBg} ${t.inputFocus}`}
                            style={{ minHeight: "42px", maxHeight: "120px" }}
                        />
                        <button
                            type="submit"
                            disabled={!chat.query.trim() || busy}
                            className={`h-[42px] px-4 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${t.sendBtn}`}
                        >
                            {busy
                                ? <span className={`w-4 h-4 border-2 rounded-full animate-spin ${t.sendSpinner}`} />
                                : <SendIcon />
                            }
                        </button>
                    </form>
                    <p className={`max-w-3xl mx-auto text-[10px] ${t.textFaint} text-center mt-1.5`}>
                        x402 Protocol • 0.001 ETH per query • Sepolia Testnet • Powered by Groq
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
