/* 
CHANGES:
- CLARITY: Simplified copy to "Ask about Crypto" (Understandable in 3s).
- SIMPLICITY: Removed decorative Orbs and complex gradients for a clean White/Black UI.
- VISUALS: Consistent Inter font at 16px. Max 2 accent colors (Emerald).
- TRUST: Removed robot graphics and technical jargon. Focus on simple features.
- FEEDBACK: Simplified progress states to text-only indicators to reduce noise.
*/

import { ConnectButton } from "@rainbow-me/rainbowkit";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../hooks/useTheme";
import { useChat, STATUS } from "../hooks/useChat";
import { SunIcon, MoonIcon, SendIcon, PlusCircleIcon, InfoIcon, AlertCircleIcon } from "lucide-react";
import Orb from "./Orb";

const SUGGESTIONS = [
    "Analyze ETH vs Solana efficiency",
    "Current Ethereum network congestion",
    "Solana market sentiment & price",
];

// ── Sub-components ────────────────────────────────────────────

const Spinner = () => (
    <span className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
);

// ── Main Component ────────────────────────────────────────────

const ChatPage = () => {
    const { toggle, t } = useTheme();
    const chat = useChat();
    const busy = [STATUS.ANALYZING, STATUS.LOADING, STATUS.AUTO_PAYING].includes(chat.status);

    // Get latest data from last message for sidebar
    const lastData = chat.messages.filter(m => m.data).slice(-1)[0]?.data;

    return (
        <div className={`flex h-screen ${t.bg} transition-colors duration-300 overflow-hidden relative`}>

            {/* ── Left Sidebar (Desktop Only) ────────────────────── */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-background/40 backdrop-blur-xl relative z-20">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/9.x/bottts/svg?seed=ChainMind" className="w-6 h-6" alt="ChainMind" />
                        </div>
                        <h1 className="text-base font-bold tracking-tight">ChainMind AI</h1>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-60">Intelligence Oracle</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-10">
                    {/* Market Brief */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Market Brief</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/50 border border-border transition-colors hover:border-primary/30">
                                <span className="text-xs font-semibold text-muted-foreground">Ethereum</span>
                                <span className="text-xs font-bold text-primary">${lastData?.ethPrice?.usd || "---"}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/50 border border-border transition-colors hover:border-emerald-500/30">
                                <span className="text-xs font-semibold text-muted-foreground">Solana</span>
                                <span className="text-xs font-bold text-emerald-500">${lastData?.solPrice?.usd || "---"}</span>
                            </div>
                        </div>
                    </section>

                    {/* Network Vitals */}
                    <section>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Network Vitals</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-surface-raised/50 border border-border">
                                <p className="text-[9px] font-bold text-muted uppercase mb-1">Gas</p>
                                <p className="text-sm font-bold tracking-tight">{lastData?.gasPrices?.safe || "--"} <span className="text-[9px] opacity-40 font-medium">Gwei</span></p>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-raised/50 border border-border">
                                <p className="text-[9px] font-bold text-muted uppercase mb-1">Latency</p>
                                <p className="text-sm font-bold tracking-tight">12 <span className="text-[9px] opacity-40 font-medium">ms</span></p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-border mt-auto">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary uppercase">Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-bold">Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Content Area ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* ── Background Orb ──────────────────────────────────── */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-1000">
                    <Orb
                        hue={145}
                        hoverIntensity={0.8}
                        rotateOnHover={true}
                        backgroundColor={t.dark ? "#020404" : "#ffffff"}
                    />
                </div>

                {/* ── Header ──────────────────────────────────────────── */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center overflow-hidden shadow-sm">
                            <img src="https://api.dicebear.com/9.x/bottts/svg?seed=ChainMind" className="w-6 h-6" alt="ChainMind" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold tracking-tight leading-none">ChainMind AI</h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-80">Oracle v1.0</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {chat.messages.length > 0 && (
                            <button
                                onClick={chat.clearChat}
                                className="h-9 px-3 rounded-md text-xs font-bold border border-border bg-surface-raised hover:bg-surface active:scale-95 transition-all flex items-center gap-2"
                            >
                                <PlusCircleIcon size={14} />
                                New Chat
                            </button>
                        )}

                        <button
                            onClick={toggle}
                            className="w-9 h-9 flex items-center justify-center rounded-md border border-border bg-surface-raised hover:bg-surface transition-all"
                        >
                            {t.dark ? <SunIcon size={16} className="text-yellow-500" /> : <MoonIcon size={16} className="text-slate-500" />}
                        </button>

                        <div className="scale-90 origin-right">
                            <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
                        </div>
                    </div>
                </header>

                {/* ── Main Area ────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto scroll-smooth relative z-10">
                    <div className="max-w-3xl mx-auto px-6 py-12">

                        {/* Minimalist Welcome */}
                        {chat.messages.length === 0 && chat.isConnected && (
                            <div className="flex flex-col items-center justify-center text-center animate-fade-in py-[10vh]">
                                <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                                    Unified Chain <span className="text-gradient">Intelligence.</span>
                                </h2>

                                <p className="text-lg text-muted mb-12 max-w-sm leading-relaxed">
                                    Your autonomous analyst for real-time cross-chain insights and gas optimization.
                                </p>

                                <div className="flex flex-wrap justify-center gap-3 max-w-xl">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => chat.runQuery(s)}
                                            className="px-5 py-2.5 rounded-xl border border-border bg-surface-raised/50 backdrop-blur-sm shadow-sm text-sm font-medium hover:border-primary/50 hover:bg-surface transition-all active:scale-95"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Locked State */}
                        {!chat.isConnected && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
                                <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-6 shadow-sm">
                                    <AlertCircleIcon size={32} className="text-muted opacity-40" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 tracking-tight">Wallet Required</h2>
                                <p className="text-base text-muted mb-10 max-w-xs leading-relaxed">Connect your wallet to access the ChainMind intelligence engine.</p>
                                <div className="transform scale-110">
                                    <ConnectButton />
                                </div>
                            </div>
                        )}

                        {/* Chat Thread */}
                        <div className="space-y-12">
                            {chat.messages.map((msg, i) => (
                                <div key={i} className="animate-fade-in">
                                    {msg.role === "user" ? (
                                        <div className="flex justify-end">
                                            <div className="max-w-[85%] bg-primary text-primary-foreground px-6 py-4 rounded-3xl rounded-tr-none text-base font-medium shadow-md">
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : msg.role === "system" ? (
                                        <div className="flex justify-center my-8">
                                            <div className="text-[11px] font-bold text-muted uppercase tracking-widest flex items-center gap-2 opacity-50 px-4 py-1.5 rounded-full border border-border bg-surface-raised/30">
                                                <InfoIcon size={12} />
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-md bg-surface-raised border border-border flex items-center justify-center">
                                                    <img src="https://api.dicebear.com/9.x/bottts/svg?seed=ChainMind" className="w-4 h-4" alt="Agent" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">ChainMind Agent</span>
                                            </div>

                                            <div className="max-w-[95%] p-6 rounded-3xl rounded-tl-none bg-surface-raised/40 backdrop-blur-xl border border-border shadow-lg space-y-6">
                                                {msg.data && (
                                                    <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-surface/50 border border-border/50 text-xs font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted uppercase text-[9px] tracking-wider">ETH</span>
                                                            <span className="text-primary">${msg.data.ethPrice?.usd}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted uppercase text-[9px] tracking-wider">SOL</span>
                                                            <span className="text-emerald-500">${msg.data.solPrice?.usd}</span>
                                                        </div>
                                                        <div className="w-px h-3 bg-border/50" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted uppercase text-[9px] tracking-wider">Gas</span>
                                                            <span>{msg.data.gasPrices?.safe} Gwei</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="text-base leading-[1.8] prose prose-sm prose-slate dark:prose-invert max-w-none opacity-95">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Simplified States */}
                        <div className="mt-12">
                            {chat.status === STATUS.PAYMENT_CONFIRM && (
                                <div className="p-8 rounded-2xl border-2 border-primary bg-surface-raised shadow-xl animate-fade-in text-center max-w-md mx-auto">
                                    <h3 className="text-xl font-bold mb-4">Payment Required</h3>
                                    <p className="text-sm text-muted mb-8 leading-relaxed">To process this high-compute request, a small Sepolia ETH protocol fee is required.</p>
                                    <button
                                        onClick={chat.confirmAutoPay}
                                        className="h-12 w-full rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Confirm & Pay
                                    </button>
                                </div>
                            )}

                            {busy && (
                                <div className="flex items-center gap-4 py-8 animate-fade-in">
                                    <Spinner />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Processing Engine...</span>
                                </div>
                            )}

                            {chat.status === STATUS.ERROR && (
                                <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 animate-fade-in flex flex-col items-center gap-4 text-center">
                                    <AlertCircleIcon size={24} />
                                    <p className="text-sm font-bold">{chat.error}</p>
                                    <button onClick={chat.dismissError} className="text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white px-6 py-2.5 rounded-lg active:scale-95 transition-all">
                                        Dismiss & Retry
                                    </button>
                                </div>
                            )}
                        </div>

                        <div ref={chat.messagesEndRef} className="h-24" />
                    </div>
                </main>

                {/* ── Input ────────────────────────────────────── */}
                {chat.isConnected && (
                    <div className="p-6 border-t border-border bg-background/80 backdrop-blur-md relative z-20">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={chat.handleSubmit} className="flex items-center gap-4">
                                <input
                                    value={chat.query}
                                    onChange={(e) => chat.setQuery(e.target.value)}
                                    onKeyDown={chat.handleKeyDown}
                                    placeholder="Ask about on-chain data..."
                                    disabled={busy}
                                    className="flex-1 h-14 px-6 bg-surface-raised border border-border rounded-xl text-base font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!chat.query.trim() || busy}
                                    className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-20 active:scale-90 transition-all group"
                                >
                                    <SendIcon size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </form>
                            <div className="mt-4 flex items-center justify-between text-[10px] text-muted font-bold tracking-widest uppercase opacity-60">
                                <span>ChainMind AI • Sepolia Testnet</span>
                                {busy && <span className="text-primary animate-pulse">Agent Active</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
