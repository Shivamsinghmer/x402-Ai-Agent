import { searchFlights } from "../services/amadeusService.js";
import { extractFlightParameters } from "../services/llmService.js";

/**
 * FlightBooking Agent Handler
 * Fetches real flight data from Amadeus and calculates ETH price.
 * 
 * Logic: 1000 USD = 0.001 ETH (1 USD = 0.000001 ETH)
 */
export const flightBookingHandler = async ({ query }) => {
    console.log(`✈️ [FlightBooking] Processing query: "${query}"`);

    try {
        // 1. Extract flight parameters from query
        const params = await extractFlightParameters(query);
        const { origin, destination, date, originCode, destCode } = params;

        if (!origin || !destination || !date || origin === "null" || destination === "null" || date === "null") {
            let missing = [];
            if (!origin || origin === "null") missing.push("origin city");
            if (!destination || destination === "null") missing.push("destination city");
            if (!date || date === "null") missing.push("departure date");

            return {
                result: `I need a bit more information to find the best flights for you. Could you please specify the **${missing.join(", ")}**? (e.g., 'Find flights from New York to London on 2025-10-15')`,
                metadata: {
                    status: "missing_parameters",
                    params,
                    category: "travel"
                }
            };
        }

        console.log(`📍 [FlightBooking] Searching flights from ${origin} to ${destination} on ${date}`);

        // 2. Fetch real data from Amadeus
        const flights = await searchFlights(origin, destination, date, originCode, destCode);


        console.log(`✈️ [FlightBooking] Found ${flights.length} flight options`);

        if (flights.length === 0) {
            return {
                result: `I'm sorry, I couldn't find any flight offers from **${origin}** to **${destination}** on **${date}**. Please try another date or check your city names!`,
                metadata: {
                    origin,
                    destination,
                    date,
                    status: "no_results",
                    category: "travel"
                }
            };
        }

        // 3. Format the response
        let result = `I found some flight options for your trip from **${origin}** to **${destination}** on **${date}**!\n\n`;

        flights.forEach((flight, index) => {
            const depTime = new Date(flight.departure).toLocaleString();
            const arrTime = new Date(flight.arrival).toLocaleString();
            
            result += `${index + 1}. **${flight.airlineName}**\n`;
            result += `   • **Price:** $${flight.priceUsd} (~${flight.priceEth} ETH Sepolia)\n`;

            result += `   • **Departure:** ${depTime}\n`;
            result += `   • **Arrival:** ${arrTime}\n`;
            result += `   • **Duration:** ${flight.duration.replace("PT", "").toLowerCase()}\n`;
            result += `   • **Stops:** ${flight.stops > 0 ? flight.stops : "Non-stop"}\n\n`;
        });

        result += `*Note: The ETH price is calculated at a fixed rate of 1000 USD = 0.001 ETH.* \n\nWhich one would you like to book?`;

        const metadata = {
            flights,
            origin,
            destination,
            date,
            source: "Amadeus API",
            timestamp: new Date().toISOString(),
            category: "travel",
            conversionRate: "1000 USD = 0.001 ETH"
        };

        return {
            result,
            metadata
        };

    } catch (error) {
        console.error("FlightBooking Handler Error:", error);
        return {
            result: "I'm sorry, I encountered an error while searching for flights. Please try again in a moment.",
            metadata: {
                error: error.message,
                category: "travel"
            }
        };
    }
};