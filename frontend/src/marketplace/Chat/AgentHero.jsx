import React from "react";
import { ChevronRightIcon } from "lucide-react";

const AgentHero = ({ activeAgent, onPromptClick }) => {
    if (activeAgent.id === "chainmind") {
        return (
            <div className="space-y-8 animate-fade-in py-10 text-center">
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-normal tracking-tighter text-foreground leading-none ">
                        Ask Anything<br />
                        <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8">About Crypto.</span>
                    </h1>
                    <p className="text-sm sm:text-lg text-foreground/40 font-medium max-w-lg mx-auto leading-relaxed">
                        Real-time prices, gas fees, and network data. <br className="hidden sm:block" /> Simple and instant.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto pt-4">
                    {activeAgent.examplePrompts?.map((s) => (
                        <button
                            key={s}
                            onClick={() => onPromptClick(s)}
                            className="px-6 py-3.5 rounded-full border border-border bg-card/60 backdrop-blur-sm hover:bg-muted hover:border-primary/20 transition-all text-xs sm:text-sm font-bold text-foreground/60 hover:text-foreground shadow-sm active:scale-95"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (activeAgent.id === "hotel-booking") {
        return (
            <div className="space-y-8 animate-fade-in py-10 text-center">
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-normal tracking-tighter text-foreground leading-none ">
                        Book Your<br />
                        <span className="text-orange-500 underline decoration-orange-500/20 underline-offset-8">Perfect Stay.</span>
                    </h1>
                    <p className="text-sm sm:text-lg text-foreground/40 font-medium max-w-lg mx-auto leading-relaxed">
                        Find hotels, compare prices, and plan your next journey. <br className="hidden sm:block" /> Simple and instant.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto pt-4">
                    {activeAgent.examplePrompts?.map((s) => (
                        <button
                            key={s}
                            onClick={() => onPromptClick(s)}
                            className="px-6 py-3.5 rounded-full border border-border bg-card/60 backdrop-blur-sm hover:bg-muted hover:border-primary/20 transition-all text-xs sm:text-sm font-bold text-foreground/60 hover:text-foreground shadow-sm active:scale-95"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in py-10">
            <div className="w-20 h-20 rounded-3xl bg-muted border border-border flex items-center justify-center text-4xl mb-6 shadow-sm overflow-hidden">
                {activeAgent.botIcon ? (
                    <img src={activeAgent.botIcon} alt={activeAgent.name} className="w-12 h-12" />
                ) : (
                    activeAgent.icon
                )}
            </div>
            <h1 className="text-4xl font-display font-normal mb-3 tracking-tighter text-foreground leading-none uppercase">
                {activeAgent.name}
            </h1>
            <p className="text-sm text-foreground/50 max-w-sm mb-10 font-medium leading-relaxed">
                {activeAgent.description}
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {activeAgent.examplePrompts?.map((s) => (
                    <button
                        key={s}
                        onClick={() => onPromptClick(s)}
                        className="text-left p-4 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all active:scale-[0.98] flex items-center justify-between group"
                    >
                        <span className="text-xs font-bold text-foreground/60 group-hover:text-foreground transition-colors line-clamp-1">{s}</span>
                        <ChevronRightIcon size={14} className="text-foreground/20 group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AgentHero;
