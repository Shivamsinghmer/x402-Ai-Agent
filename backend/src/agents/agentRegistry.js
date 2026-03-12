import { chainmindHandler } from "./chainmind.handler.js";
import { hotelBookingHandler } from "./hotelBooking.handler.js";
import { flightBookingHandler } from "./flightBooking.handler.js";

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
    },
    {
        id: "flight-booking",
        name: "FlightBooking Agent",
        description: "Search and compare flights globally. AI-powered deals and multi-airline options.",
        category: "travel",
        price: "0.003",
        icon: "✈️",
        botIcon: "https://api.dicebear.com/9.x/bottts/svg?seed=Flight",
        handler: flightBookingHandler,
        examplePrompts: [
            "Find flights from New York to London for next Friday",
            "Cheapest flights from Delhi to Dubai on Oct 10",
            "Book a flight from Paris to Tokyo in December"
        ]
    }

];

/**
 * Helper to find agent by ID
 */
export const getAgentById = (id) => agentRegistry.find(agent => agent.id === id);
