import React from "react";
import { AlertCircleIcon } from "lucide-react";

/**
 * Loading spinner atom.
 */
export const Spinner = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border animate-fade-in shadow-sm">
        <span className="w-2.5 h-2.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Computing</span>
    </div>
);

/**
 * Overlay for states like busy, error, and payment confirmation.
 */
const ChatStatus = ({ status, busy, error, dismissError, confirmAutoPay, activeAgent }) => {
    return (
        <div className="mt-12">
            {status === "payment_confirm" && (
                <div className="p-8 rounded-2xl border-2 border-primary/10 bg-card text-center max-w-sm mx-auto animate-scale-in shadow-lg">
                    <h3 className="text-lg font-bold mb-2 tracking-tight text-foreground">Payment Required</h3>
                    <p className="text-xs text-foreground/50 mb-8 leading-relaxed font-medium">
                        Authorize <span className="text-foreground font-bold">{activeAgent.price} ETH</span> to process this query via the x402 protocol.
                    </p>
                    <button
                        onClick={confirmAutoPay}
                        className="h-11 w-full rounded-xl bg-primary text-background text-xs font-bold active:scale-[0.98] transition-all"
                    >
                        Authorize Payment
                    </button>
                </div>
            )}

            {busy && (
                <div className="flex items-center justify-center py-6 animate-fade-in">
                    <Spinner />
                </div>
            )}

            {status === "error" && (
                <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-center max-w-sm mx-auto animate-fade-in flex flex-col items-center gap-3">
                    <AlertCircleIcon size={20} />
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                    <button onClick={dismissError} className="text-[10px] uppercase tracking-widest font-bold underline underline-offset-4">
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatStatus;
