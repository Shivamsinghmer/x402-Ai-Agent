import React from "react";

const AgentCard = ({ agent, onOpen }) => {
    return (
        <div className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/40 transition-all flex flex-col h-full shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-2xl overflow-hidden">
                    {agent.botIcon ? (
                        <img src={agent.botIcon} alt={agent.name} className="w-8 h-8" />
                    ) : (
                        agent.icon
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{agent.name}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        {agent.category}
                    </div>
                </div>
            </div>

            <p className="text-sm text-foreground/70 mb-8 leading-relaxed line-clamp-2 font-medium">
                {agent.description}
            </p>

            <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                <div>
                    <span className="block text-[9px] font-bold text-foreground/40 uppercase tracking-widest leading-none mb-1 text-xs">Fee</span>
                    <span className="text-sm font-bold text-foreground">{agent.price} ETH</span>
                </div>
                <button
                    onClick={() => onOpen(agent.id)}
                    className="h-9 px-5 rounded-lg bg-primary text-background text-xs font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                    Open
                </button>
            </div>
        </div>
    );
};

export default AgentCard;
