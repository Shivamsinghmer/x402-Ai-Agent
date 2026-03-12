// ── Chat hook — ask once before auto-paying ───────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { queryAgent, agentAutoPay, getChatHistory, getAgentsRegistry } from "../services/api";

export const STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    PAYMENT_CONFIRM: "payment_confirm",   // Waiting for user to confirm
    AUTO_PAYING: "auto_paying",           // Agent paying on-chain
    ANALYZING: "analyzing",
    SUCCESS: "success",
    ERROR: "error",
};

export const useChat = (agentId = null) => {
    const { address, isConnected } = useAccount();
    const messagesEndRef = useRef(null);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState(STATUS.IDLE);
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [agents, setAgents] = useState([]);
    const activeAgentId = agentId;
    const [currentChatId, setCurrentChatId] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [pendingQuery, setPendingQuery] = useState(null);
    const [error, setError] = useState(null);

    // Booking Dialog State
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [pendingHotel, setPendingHotel] = useState(null);
    const [isFlightDialogOpen, setIsFlightDialogOpen] = useState(false);
    const [pendingFlight, setPendingFlight] = useState(null);

    // Initial Load: Agents Registry
    useEffect(() => {
        const fetchAgents = async () => {
            const data = await getAgentsRegistry();
            setAgents(data);
        };
        fetchAgents();
    }, []);

    // Sync History on Connect/Agent change
    useEffect(() => {
        if (isConnected && address) {
            loadHistory();
        } else {
            setHistory([]);
            setMessages([]);
            setCurrentChatId(null);
        }
    }, [isConnected, address, activeAgentId]);

    const loadHistory = async () => {
        try {
            const result = await getChatHistory(address, activeAgentId);
            if (result.status === "success") {
                setHistory(result.data);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const selectChat = (chat) => {
        setCurrentChatId(chat._id);
        setMessages(chat.messages || []);
        setStatus(STATUS.IDLE);
        setQuery("");
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setStatus(STATUS.IDLE);
        setQuery("");
    };

    const getActiveAgent = () => agents.find(a => a.id === activeAgentId);

    // Auto-scroll to bottom
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, status]);

    const addMessage = (role, content, data) => {
        setMessages((prev) => [...prev, { role, content, ...(data && { data }) }]);
    };

    const confirmAutoPay = async () => {
        const agent = getActiveAgent();
        if (!agent) return;

        setStatus(STATUS.AUTO_PAYING);
        addMessage("system", `🤖 Agent ${agent.name} is paying autonomously...`);

        try {
            const result = await agentAutoPay(address, activeAgentId);

            if (result.status === "auto_pay_success") {
                addMessage(
                    "system",
                    `✅ Paid **${result.payment.amountEth} ETH** — [tx ↗](https://sepolia.etherscan.io/tx/${result.payment.transactionHash})`
                );
                if (pendingQuery) {
                    setTimeout(() => runQuery(pendingQuery, true), 300);
                }
            } else {
                setError(result.message || "Auto-pay failed.");
                setStatus(STATUS.ERROR);
            }
        } catch (err) {
            console.error("Auto-pay error:", err);
            const msg = err.response?.data?.message || err.message || "Auto-pay failed.";
            addMessage("system", `⚠️ Auto-pay failed: ${msg}`);
            setError(msg);
            setStatus(STATUS.ERROR);
        }
    };

    const runQuery = async (q, skipAddUserMsg = false) => {
        if (!activeAgentId) return;

        if (!skipAddUserMsg) {
            addMessage("user", q);
        }
        setStatus(STATUS.ANALYZING);
        setError(null);

        try {
            const result = await queryAgent(activeAgentId, q, address, currentChatId);
            const d = result.data;

            if (!currentChatId && result.chatId) {
                setCurrentChatId(result.chatId);
                loadHistory();
            }

            addMessage("assistant", d.aiAnalysis, d);
            setStatus(STATUS.SUCCESS);
            setPendingQuery(null);
        } catch (err) {
            if (err.response?.status === 402) {
                setPaymentInfo(err.response.data);
                setPendingQuery(q);
                setStatus(STATUS.PAYMENT_CONFIRM);
                return;
            }
            const msg = err.response?.data?.message || err.message || "Query failed.";
            setError(msg);
            setStatus(STATUS.ERROR);
        }
    };

    const handleSubmit = useCallback(
        (e) => {
            e?.preventDefault();
            if (!query.trim() || !address || !activeAgentId) return;
            const q = query.trim();
            addMessage("user", q);
            setQuery("");
            setError(null);
            setStatus(STATUS.LOADING);
            runQuery(q, true);
        },
        [query, address, currentChatId, activeAgentId]
    );

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const dismissError = () => {
        setStatus(STATUS.IDLE);
        setError(null);
    };

    const handleBookingConfirm = async (details) => {
        setIsBookingDialogOpen(false);
        const hotel = pendingHotel;
        if (!hotel || !address) return;

        setStatus(STATUS.AUTO_PAYING);
        addMessage("system", `🏨 Booking confirmed: **${details.nights} night(s)** for **${details.rooms} room(s)**.`);
        addMessage("system", `🤖 Agent is processing the calculated payment of **${details.totalEth} ETH**...`);

        try {
            const result = await agentAutoPay(address, activeAgentId, details.totalEth);

            if (result.status === "auto_pay_success") {
                addMessage(
                    "assistant",
                    `🎉 **Booking Confirmed!**\n\nI have successfully paid **${details.totalEth} ETH** for your stay at **${hotel.name}**.\n\n**Details:**\n- Check-in: ${details.checkIn}\n- Check-out: ${details.checkOut}\n- Adults: ${details.adults}\n- Rooms: ${details.rooms}\n\nTransaction Receipt: [${result.payment.transactionHash.substring(0, 10)}...](https://sepolia.etherscan.io/tx/${result.payment.transactionHash})`,
                    {
                        type: "booking_confirmation",
                        hotel,
                        bookingDetails: details,
                        transactionHash: result.payment.transactionHash
                    }
                );
                setStatus(STATUS.SUCCESS);
            } else {
                throw new Error(result.message || "Booking payment failed.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            const msg = err.response?.data?.message || err.message || "Booking failed.";
            addMessage("system", `⚠️ Booking Failed: ${msg}`);
            setError(msg);
            setStatus(STATUS.ERROR);
        }
    };

    const handleFlightBookingConfirm = async (details) => {
        setIsFlightDialogOpen(false);
        const flight = pendingFlight;
        if (!flight || !address) return;

        setStatus(STATUS.AUTO_PAYING);
        addMessage("system", `✈️ Flight booking confirmed: **${details.passengers} passenger(s)**, **${details.cabinClass}** class.`);
        addMessage("system", `🤖 Agent is processing the calculated payment of **${details.totalEth} ETH**...`);

        try {
            const result = await agentAutoPay(address, activeAgentId, details.totalEth);

            if (result.status === "auto_pay_success") {
                addMessage(
                    "assistant",
                    `🎉 **Flight Booked Successfully!**\n\nI have successfully paid **${details.totalEth} ETH** for your flight with **${flight.airlineName}**.\n\n**Trip Summary:**\n- Route: ${flight.origin} ➔ ${flight.destination}\n- Date: ${flight.date}\n- Class: ${details.cabinClass}\n- Passengers: ${details.passengers}\n\nTransaction Receipt: [${result.payment.transactionHash.substring(0, 10)}...](https://sepolia.etherscan.io/tx/${result.payment.transactionHash})`,
                    {
                        type: "flight_confirmation",
                        flight,
                        bookingDetails: details,
                        transactionHash: result.payment.transactionHash
                    }
                );
                setStatus(STATUS.SUCCESS);
            } else {
                throw new Error(result.message || "Flight booking failed.");
            }
        } catch (err) {
            console.error("Flight booking error:", err);
            const msg = err.response?.data?.message || err.message || "Flight booking failed.";
            addMessage("system", `⚠️ Flight Booking Failed: ${msg}`);
            setError(msg);
            setStatus(STATUS.ERROR);
        }
    };

    const handleBookingClose = () => {
        setIsBookingDialogOpen(false);
        setPendingHotel(null);
    };

    const handleFlightBookingClose = () => {
        setIsFlightDialogOpen(false);
        setPendingFlight(null);
    };

    // Listen for booking events from results
    useEffect(() => {
        const handleHotelBooking = (e) => {
            const hotel = e.detail;
            setPendingHotel(hotel);
            setIsBookingDialogOpen(true);
        };
        const handleFlightBooking = (e) => {
            const flight = e.detail;
            setPendingFlight(flight);
            setIsFlightDialogOpen(true);
        };
        window.addEventListener('initiate-hotel-booking', handleHotelBooking);
        window.addEventListener('initiate-flight-booking', handleFlightBooking);
        return () => {
            window.removeEventListener('initiate-hotel-booking', handleHotelBooking);
            window.removeEventListener('initiate-flight-booking', handleFlightBooking);
        };
    }, [address, activeAgentId, agents]);

    return {
        address, isConnected, query, setQuery, status, messages, history,
        paymentInfo, error, messagesEndRef, currentChatId,
        agents, activeAgentId, activeAgent: getActiveAgent(),
        handleSubmit, handleKeyDown, dismissError, runQuery,
        confirmAutoPay, selectChat, startNewChat,
        isBookingDialogOpen, setIsBookingDialogOpen, pendingHotel,
        handleBookingConfirm, handleBookingClose,
        isFlightDialogOpen, setIsFlightDialogOpen, pendingFlight,
        handleFlightBookingConfirm, handleFlightBookingClose
    };

};
