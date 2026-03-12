import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
const AMADEUS_HOSTNAME = process.env.AMADEUS_HOSTNAME || "test"; // 'test' or 'production'

const BASE_URL = AMADEUS_HOSTNAME === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";

let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Get Amadeus OAuth2 Token
 */
const getAccessToken = async () => {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    try {
        const response = await axios.post(`${BASE_URL}/v1/security/oauth2/token`,
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: AMADEUS_API_KEY,
                client_secret: AMADEUS_API_SECRET
            }).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        accessToken = response.data.access_token;
        tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // Buffer of 1 min
        return accessToken;
    } catch (error) {
        console.error("Amadeus Auth Error:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with Amadeus API.");
    }
};

/**
 * Search Hotels in a specific city/location string
 */
export const searchHotelsByCity = async (cityName, fallbackCode = null) => {
    try {
        const token = await getAccessToken();

        // 1. Get City Code
        const cityCode = await getCityCode(cityName, fallbackCode);
        if (!cityCode) {
            console.warn(`No city code found for: ${cityName}`);
            return [];
        }


        console.log(`🔎 Searching hotels for city code: ${cityCode}`);

        // 2. Find hotels in that city
        const hotelListResponse = await axios.get(`${BASE_URL}/v1/reference-data/locations/hotels/by-city`, {
            params: { cityCode },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!hotelListResponse.data.data || hotelListResponse.data.data.length === 0) {
            return [];
        }

        // Take first 10 hotels
        const hotels = hotelListResponse.data.data.slice(0, 10);
        const hotelIds = hotels.map(h => h.hotelId).join(",");

        // 3. Get price offers for these hotels
        const offersResponse = await axios.get(`${BASE_URL}/v3/shopping/hotel-offers`, {
            params: { hotelIds, adults: 1, currencyCode: "USD" },
            headers: { Authorization: `Bearer ${token}` }
        });

        const offers = offersResponse.data.data || [];

        // Transform and add ETH prices
        return offers.map(offer => {
            const usdPrice = parseFloat(offer.offers[0]?.price?.total || 0);
            const ethPrice = (usdPrice * 0.000001).toFixed(6); // 1000 USD = 0.001 ETH logic

            return {
                hotelId: offer.hotel.hotelId,
                name: offer.hotel.name,
                rating: offer.hotel.rating,
                priceUsd: usdPrice,
                priceEth: ethPrice,
                currency: "USD/ETH",
                // Amadeus v3 sometimes puts city in address, sometimes directly
                cityName: offer.hotel.cityName || offer.hotel.address?.cityName || "Unknown City",
                countryCode: offer.hotel.countryCode || offer.hotel.address?.countryCode || "Unknown Country",
                address: offer.hotel.address,
                latitude: offer.hotel.latitude,
                longitude: offer.hotel.longitude,
                description: offer.hotel.description?.text?.substring(0, 200) + "..."
            };
        });

    } catch (error) {
        console.error("Amadeus Search Error:", error.response?.data || error.message);
        return [];
    }
};

/**
 * Get City Code from Name or use direct IATA code if provided
 */
export const getCityCode = async (cityName, fallbackCode = null) => {
    // If cityName looks like an IATA code (3 uppercase letters), use it directly
    if (cityName && cityName.length === 3 && cityName === cityName.toUpperCase()) {
        return cityName;
    }

    try {
        const token = await getAccessToken();
        const response = await axios.get(`${BASE_URL}/v1/reference-data/locations`, {
            params: {
                keyword: cityName,
                subType: "CITY,AIRPORT"
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.data && response.data.data.length > 0) {
            console.log(`🌍 [Amadeus] Found ${response.data.data.length} locations for keyword: "${cityName}"`);

            // 1. Try to find an exact match (IATACode or name)
            const match = response.data.data.find(loc =>
                loc.iataCode === cityName.toUpperCase() ||
                loc.name.toLowerCase() === cityName.toLowerCase() ||
                loc.address?.cityName?.toLowerCase() === cityName.toLowerCase()
            ) || response.data.data[0];

            console.log(`✅ [Amadeus] Selected city code: ${match.iataCode} (${match.name})`);
            return match.iataCode;
        }

        // 2. If no results and we have a fallbackCode from LLM, use it
        if (fallbackCode && fallbackCode.length === 3 && fallbackCode !== "null") {
            console.log(`ℹ️ [Amadeus] No direct results for "${cityName}", using LLM fallback code: ${fallbackCode}`);
            return fallbackCode.toUpperCase();
        }

        console.warn(`⚠️ [Amadeus] No results found for keyword: "${cityName}"`);
        return null;
    } catch (error) {
        console.error("Amadeus City search error:", error.response?.data || error.message);
        // Last resort fallback
        if (fallbackCode && fallbackCode.length === 3 && fallbackCode !== "null") {
            return fallbackCode.toUpperCase();
        }
        return null;
    }
};


/**
 * Search Flights based on origin, destination and date
 */
export const searchFlights = async (origin, destination, departureDate, originFallback = null, destFallback = null) => {
    try {
        const token = await getAccessToken();

        // 1. Get IATA Codes for Origin and Destination
        const originCode = await getCityCode(origin, originFallback);
        const destCode = await getCityCode(destination, destFallback);

        if (!originCode || !destCode) {
            console.warn(`Could not find IATA codes for: ${origin} -> ${destination}`);
            return [];
        }



        console.log(`✈️ [Amadeus] Searching flights: ${originCode} -> ${destCode} on ${departureDate}`);

        // 2. Fetch Flight Offers
        const response = await axios.get(`${BASE_URL}/v2/shopping/flight-offers`, {
            params: {
                originLocationCode: originCode,
                destinationLocationCode: destCode,
                departureDate: departureDate,
                adults: 1,
                currencyCode: "USD",
                max: 5 // Limit to 5 results
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data.data || response.data.data.length === 0) {
            return [];
        }

        // 3. Transform data and calculate ETH prices
        const carriers = response.data.dictionaries?.carriers || {};

        return response.data.data.map(offer => {
            const usdPrice = parseFloat(offer.price.total);
            const ethPrice = (usdPrice * 0.000001).toFixed(6); // 1000 USD = 0.001 ETH logic

            // Extract airline info
            const airlineCode = offer.validatingAirlineCodes?.[0];
            const airlineName = carriers[airlineCode] || airlineCode;
            
            return {
                id: offer.id,
                airlineCode,
                airlineName,
                departure: offer.itineraries[0].segments[0].departure.at,
                arrival: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at,
                duration: offer.itineraries[0].duration,
                stops: offer.itineraries[0].segments.length - 1,
                priceUsd: usdPrice,
                priceEth: ethPrice,
                currencyCode: "USD",
                lastTicketingDate: offer.lastTicketingDate,
                numberOfBookableSeats: offer.numberOfBookableSeats
            };
        });


    } catch (error) {
        console.error("Amadeus Flight Search Error:", error.response?.data || error.message);
        return [];
    }
};

