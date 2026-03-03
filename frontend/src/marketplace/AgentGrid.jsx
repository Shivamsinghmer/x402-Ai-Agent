import React from "react";
import AgentCard from "./AgentCard";

/**
 * Grid layout for displaying agent cards in the marketplace.
 */
const AgentGrid = ({ agents, onOpenAgent }) => {
    if (agents.length === 0) {
        return (
            <div className="text-center py-32 bg-muted/20 rounded-3xl border border-dashed border-border shadow-sm animate-fade-in flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4 text-2xl">
                    🕵️‍♂️
                </div>
                <p className="text-xs text-foreground/40 font-bold uppercase tracking-[0.2em]">No agents found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {agents.map(agent => (
                <AgentCard
                    key={agent.id}
                    agent={agent}
                    onOpen={onOpenAgent}
                />
            ))}
        </div>
    );
};

export default AgentGrid;
