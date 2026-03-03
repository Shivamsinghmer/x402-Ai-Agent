import { searchHotelsByCity } from "../services/amadeusService.js";
import { extractCityName } from "../services/llmService.js";

/**
 * HotelBooking Agent Handler
 * Fetches real hotel data from Amadeus and calculates ETH price.
 * 
 * Logic: 1000 USD = 0.001 ETH (1 USD = 0.000001 ETH)
 */
export const hotelBookingHandler = async ({ query }) => {
    console.log(`🏨 [HotelBooking] Processing query: "${query}"`);

    try {
        // 1. Extract city from query
        const cityName = await extractCityName(query);

        if (!cityName) {
            return {
                result: "I couldn't quite catch which city you're interested in. Could you please specify the city? (e.g., 'Find hotels in Tokyo')",
                metadata: {
                    status: "missing_location",
                    category: "travel"
                }
            };
        }

        console.log(`📍 [HotelBooking] Attempting to find hotels in: "${cityName}"`);

        // 2. Fetch real data from Amadeus
        const hotels = await searchHotelsByCity(cityName);

        console.log(`🏨 [HotelBooking] Found ${hotels.length} hotels in ${cityName}`);

        if (hotels.length === 0) {
            console.warn(`⚠️ [HotelBooking] No hotels returned from Amadeus for: ${cityName}`);
            return {
                result: `I'm sorry, I couldn't find any hotel offers in **${cityName}** at the moment. Please try another city or check back later!`,
                metadata: {
                    cityName,
                    status: "no_results",
                    category: "travel"
                }
            };
        }

        // 3. Format the response
        let result = `I found some great hotel options in **${cityName}**! Here are the top picks for you:\n\n`;

        hotels.forEach((hotel, index) => {
            result += `${index + 1}. **${hotel.name}**\n`;
            result += `   • **Price:** $${hotel.priceUsd} (~${hotel.priceEth} ETH Sepolia)\n`;
            if (hotel.rating) result += `   • **Rating:** ${hotel.rating} ⭐\n`;
            result += `   • **Location:** ${hotel.cityName}, ${hotel.countryCode}\n\n`;
        });

        result += `*Note: The ETH price is calculated at a fixed rate of 1000 USD = 0.001 ETH as requested.* \n\nWould you like to proceed with one of these?`;

        const metadata = {
            hotels,
            cityName,
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
        console.error("HotelBooking Handler Error:", error);
        return {
            result: "I'm sorry, I encountered an error while searching for hotels. Please try again in a moment.",
            metadata: {
                error: error.message,
                category: "travel"
            }
        };
    }
};
