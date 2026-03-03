import React from "react";
import { SendIcon } from "lucide-react";

/**
 * The floating chat input area.
 */
const ChatInput = ({ query, setQuery, handleSubmit, handleKeyDown, busy, activeAgentName }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="max-w-2xl mx-auto px-6 pb-12">
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 pointer-events-auto shadow-2xl animate-fade-in mb-4">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${activeAgentName}...`}
                            disabled={busy}
                            className="flex-1 h-12 px-4 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium placeholder:text-foreground/30 text-foreground"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || busy}
                            className="w-12 h-12 rounded-xl bg-primary text-background flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all shrink-0 shadow-sm"
                        >
                            <SendIcon size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
