import React from "react";
import { ArrowLeftIcon } from "lucide-react";
import AgentHero from "./Chat/AgentHero";
import ChatMessage from "./Chat/ChatMessage";
import ChatInput from "./Chat/ChatInput";
import ChatStatus from "./Chat/ChatStatus";
import BookingDialog from "./Chat/BookingDialog";

/**
 * Main Agent Chat view component.
 * Orcherstrates the chat experience for a specific agent.
 */
const AgentChat = ({ chat, backToMarketplace }) => {
    const {
        activeAgent,
        messages,
        query,
        setQuery,
        status,
        handleSubmit,
        handleKeyDown,
        busy,
        messagesEndRef,
        confirmAutoPay,
        error,
        dismissError,
        isBookingDialogOpen,
        setIsBookingDialogOpen,
        pendingHotel,
        handleBookingConfirm,
        handleBookingClose
    } = chat;

    if (!activeAgent) return null;

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background h-full overflow-hidden animate-fade-in font-sans relative">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm z-20">
                <div className="flex items-center gap-5">
                    <button
                        onClick={backToMarketplace}
                        className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors text-foreground/50 hover:text-foreground"
                    >
                        <ArrowLeftIcon size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-lg overflow-hidden">
                            {activeAgent.botIcon ? (
                                <img src={activeAgent.botIcon} alt={activeAgent.name} className="w-5 h-5" />
                            ) : (
                                activeAgent.icon
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground">{activeAgent.name}</h2>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{activeAgent.category}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        {activeAgent.price} ETH / query
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${busy ? "bg-primary animate-pulse" : "bg-emerald-500"}`} />
                </div>
            </header>

            {/* Chat Thread */}
            <main className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative bg-background flex flex-col ${messages.length === 0 ? "justify-center" : ""}`}>
                <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col flex-1 w-full">

                    {messages.length === 0 && (
                        <AgentHero
                            activeAgent={activeAgent}
                            onPromptClick={(p) => chat.runQuery(p)}
                        />
                    )}

                    <div className="space-y-10">
                        {messages.map((msg, i) => (
                            <ChatMessage
                                key={i}
                                msg={msg}
                                activeAgent={activeAgent}
                            />
                        ))}
                    </div>

                    <ChatStatus
                        status={status}
                        busy={busy}
                        error={error}
                        dismissError={dismissError}
                        confirmAutoPay={confirmAutoPay}
                        activeAgent={activeAgent}
                    />

                    {messages.length > 0 && <div ref={messagesEndRef} className="h-40" />}
                </div>
            </main>

            {/* Floating Input Area */}
            <ChatInput
                query={query}
                setQuery={setQuery}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                busy={busy}
                activeAgentName={activeAgent.name}
            />

            <BookingDialog
                isOpen={isBookingDialogOpen}
                hotel={pendingHotel}
                onClose={handleBookingClose}
                onConfirm={handleBookingConfirm}
            />
        </div>
    );
};

export default AgentChat;
