import React from "react";
import { SearchIcon } from "lucide-react";

/**
 * Filter bar for searching and categorizing agents in the marketplace.
 */
const MarketplaceFilters = ({ search, setSearch, category, setCategory, categories }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search agents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 transition-all font-medium text-foreground shadow-sm"
                />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full sm:w-auto">
                {categories.map(c => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`h-11 px-6 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${category === c
                            ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/10"
                            : "bg-muted border-border text-foreground/50 hover:bg-card hover:border-primary/40"
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MarketplaceFilters;
