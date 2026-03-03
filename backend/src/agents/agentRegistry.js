import { chainmindHandler } from "./chainmind.handler.js";
import { hotelBookingHandler } from "./hotelBooking.handler.js";

/**
 * Agent Registry
 * Central configuration for all available agents in the marketplace.
 */
export const agentRegistry = [
    {
        id: "chainmind",
        name: "ChainMind AI",
        description: "Real-time ETH and Solana market data, gas prices, network congestion, cross-chain analysis",
        category: "crypto",
        price: "0.001",
        icon: "🧠",
        botIcon: "https://api.dicebear.com/9.x/bottts/svg?seed=ChainMind",
        handler: chainmindHandler,
        examplePrompts: [
            "Analyze ETH vs Solana efficiency",
            "Current Ethereum network congestion",
            "Solana market sentiment & price"
        ]
    },
    {
        id: "hotel-booking",
        name: "HotelBooking Agent",
        description: "Find and book hotels worldwide with ease. AI-powered travel recommendations.",
        category: "travel",
        price: "0.002",
        icon: "🏨",
        botIcon: "https://api.dicebear.com/9.x/bottts/svg?seed=Hotel",
        handler: hotelBookingHandler,
        examplePrompts: [
            "Find hotels in Paris under $100",
            "Luxurious stays in Tokyo",
            "Budget friendly hotels near Central Park"
        ]
    }
];

/**
 * Helper to find agent by ID
 */
export const getAgentById = (id) => agentRegistry.find(agent => agent.id === id);
