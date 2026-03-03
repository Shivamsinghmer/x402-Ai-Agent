import React from "react";
import MarketplaceFilters from "./MarketplaceFilters";
import AgentGrid from "./AgentGrid";

/**
 * The main landing page for the marketplace.
 * Displays all available AI agents with searching and filtering options.
 */
const MarketplaceHome = ({ agents, onOpenAgent, isConnected }) => {
    const [search, setSearch] = React.useState("");
    const [category, setCategory] = React.useState("all");

    // Extract categories directly from the agent list.
    const categories = ["all", ...new Set(agents.map(a => a.category))];

    // Responsive filtering logic.
    const filteredAgents = agents.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || a.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto px-6 animate-fade-in w-full bg-background font-sans flex flex-col min-h-full">
            {/* Page Header */}
            <div className="mb-16">
                <div className="space-y-4 mb-12">
                    <h1 className="text-5xl sm:text-7xl font-display font-normal mb-3 tracking-tighter text-foreground leading-none">
                        AI Agent <br className="sm:hidden" /> Marketplace
                    </h1>
                    <p className="text-base text-foreground/40 font-medium max-w-lg leading-relaxed">
                        Access specialized intelligence and on-chain tools secured by the x402 protocol.
                    </p>
                </div>

                {/* Extracted Filter Component */}
                <MarketplaceFilters
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                />
            </div>

            {/* Extracted Agent Card Grid */}
            <AgentGrid
                agents={filteredAgents}
                onOpenAgent={onOpenAgent}
            />
        </div>
    );
};

export default MarketplaceHome;
