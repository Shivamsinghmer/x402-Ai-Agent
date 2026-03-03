import React from "react";
import {
    LayoutGridIcon,
    HistoryIcon,
    WalletIcon,
    XIcon,
    SunIcon,
    MoonIcon
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Sidebar component for navigation and session history.
 */
const Sidebar = ({
    activeAgentId,
    history,
    currentChatId,
    onMarketplaceClick,
    onChatSelect,
    onToggleTheme,
    isDark,
    onCloseMobile,
    isOpen,
    address
}) => {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
            <div className="flex flex-col h-full bg-card">
                {/* Brand */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center font-black text-lg shadow-sm">
                            X
                        </div>
                        <h1 className="text-xl font-display font-normal tracking-tighter pt-0.5 text-foreground">
                            Open x402
                        </h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onToggleTheme}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/50 hover:text-foreground"
                            title="Toggle Theme"
                        >
                            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                        </button>
                        <button
                            onClick={onCloseMobile}
                            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors text-foreground/50"
                        >
                            <XIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                    {/* Main Actions */}
                    <div className="space-y-1">
                        <button
                            onClick={onMarketplaceClick}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${!activeAgentId
                                ? "bg-primary text-background shadow-md shadow-primary/20"
                                : "text-foreground/50 hover:bg-muted hover:text-foreground hover:border-border"
                                }`}
                        >
                            <LayoutGridIcon size={16} />
                            Marketplace
                        </button>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div className="px-4 mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">History</span>
                            <HistoryIcon size={12} className="text-foreground/20" />
                        </div>
                        <div className="space-y-1">
                            {history.length === 0 ? (
                                <div className="px-4 py-6 text-center border border-dashed border-border rounded-xl bg-muted/20">
                                    <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-widest">No history</p>
                                </div>
                            ) : (
                                history.slice(0, 5).map((h) => (
                                    <button
                                        key={h._id}
                                        onClick={() => onChatSelect(h)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all group flex flex-col gap-1 border ${currentChatId === h._id
                                            ? "bg-muted border-primary/20"
                                            : "border-transparent hover:bg-muted hover:border-border"
                                            }`}
                                    >
                                        <span className={`text-[11px] font-bold truncate transition-colors ${currentChatId === h._id ? "text-primary" : "text-foreground/70 group-hover:text-foreground"
                                            }`}>
                                            {h.title}
                                        </span>
                                        <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest leading-none">
                                            {new Date(h.updatedAt).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Wallet */}
                <div className="p-4 bg-muted border-t border-border mt-auto">
                    <div className="p-5 rounded-[1.5rem] bg-card border border-border/50 shadow-sm overflow-hidden relative group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <WalletIcon size={18} />
                            </div>
                            <ConnectButton label="Connect" accountStatus="address" showBalance={false} chainStatus="none" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
