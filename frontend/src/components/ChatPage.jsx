import React from "react";
import { useAccount } from "wagmi";
import { MenuIcon, SunIcon, MoonIcon } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../hooks/useTheme";
import MarketplaceHome from "../marketplace/MarketplaceHome";
import AgentChat from "../marketplace/AgentChat";
import Sidebar from "./Sidebar";

/** 
 * Main layout of the application. 
 * Orchestrates routing between Marketplace and individual Agent chats. 
 */
const ChatPage = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { address, isConnected } = useAccount();
    const chat = useChat(agentId);
    const { toggle, t } = useTheme();

    const {
        history,
        agents,
        activeAgentId,
        selectChat,
        currentChatId
    } = chat;

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
            {/* Sidebar Component */}
            <Sidebar
                activeAgentId={activeAgentId}
                history={history}
                currentChatId={currentChatId}
                onMarketplaceClick={() => {
                    navigate("/");
                    chat.startNewChat();
                    setIsMobileMenuOpen(false);
                }}
                onChatSelect={(h) => {
                    const targetAgent = h.agentId || "chainmind";
                    if (activeAgentId !== targetAgent) {
                        navigate(`/${targetAgent}`);
                    }
                    selectChat(h);
                    setIsMobileMenuOpen(false);
                }}
                onToggleTheme={toggle}
                isDark={t.dark}
                isOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
                address={address}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative bg-background">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                        <MenuIcon size={20} />
                    </button>
                    <div className="text-xl font-display font-normal tracking-tighter text-foreground">Open x402</div>
                    <button
                        onClick={toggle}
                        className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors text-foreground/50"
                    >
                        {t.dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </button>
                </header>

                {/* Routing / Page Views */}
                <div className="flex-1 overflow-hidden flex flex-col bg-background relative">
                    {activeAgentId ? (
                        <AgentChat
                            chat={chat}
                            backToMarketplace={() => {
                                navigate("/");
                                chat.startNewChat();
                            }}
                        />
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar py-12">
                            <MarketplaceHome
                                agents={agents}
                                onOpenAgent={(id) => {
                                    navigate(`/${id}`);
                                    chat.startNewChat();
                                }}
                                isConnected={isConnected}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default ChatPage;
