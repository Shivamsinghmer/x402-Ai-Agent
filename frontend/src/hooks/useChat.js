// ── Chat hook — ask once before auto-paying ───────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { queryAgent, agentAutoPay } from "../services/api";

export const STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    PAYMENT_CONFIRM: "payment_confirm",   // Waiting for user to confirm
    AUTO_PAYING: "auto_paying",           // Agent paying on-chain
    ANALYZING: "analyzing",
    SUCCESS: "success",
    ERROR: "error",
};

export const useChat = () => {
    const { address, isConnected } = useAccount();
    const messagesEndRef = useRef(null);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState(STATUS.IDLE);
    const [messages, setMessages] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [pendingQuery, setPendingQuery] = useState(null);
    const [error, setError] = useState(null);

    // Auto-scroll to bottom on new messages or status changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, status]);

    const addMessage = (role, content, data) => {
        setMessages((prev) => [...prev, { role, content, ...(data && { data }) }]);
    };

    // ── User confirms payment → agent pays autonomously ──────
    const confirmAutoPay = async () => {
        setStatus(STATUS.AUTO_PAYING);
        addMessage("system", "🤖 Agent is paying autonomously...");

        try {
            const result = await agentAutoPay(address);

            if (result.status === "auto_pay_success") {
                addMessage(
                    "system",
                    `✅ Paid **${result.payment.amountEth} ETH** — [tx ↗](https://sepolia.etherscan.io/tx/${result.payment.transactionHash})`
                );
                // Now retry the query — payment credit is ready
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
        if (!skipAddUserMsg) {
            addMessage("user", q);
        }
        setStatus(STATUS.ANALYZING);
        setError(null);

        try {
            const result = await queryAgent(q, address);
            const d = result.data;
            addMessage("assistant", d.aiAnalysis, {
                ethPrice: d.ethPrice,
                solPrice: d.solPrice,
                gasPrices: d.gasPrices,
                model: d.model,
                timestamp: d.timestamp,
            });
            setStatus(STATUS.SUCCESS);
            setPendingQuery(null);
        } catch (err) {
            if (err.response?.status === 402) {
                // Show confirmation prompt — don't auto-pay yet
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
            if (!query.trim() || !address) return;
            const q = query.trim();
            addMessage("user", q);
            setQuery("");
            setError(null);
            setStatus(STATUS.LOADING);
            runQuery(q, true);
        },
        [query, address]
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

    const clearChat = () => {
        setMessages([]);
        setStatus(STATUS.IDLE);
        setQuery("");
        setPendingQuery(null);
        setPaymentInfo(null);
        setError(null);
    };

    return {
        // State
        address, isConnected, query, setQuery, status, messages,
        paymentInfo, error, messagesEndRef,
        // Actions
        handleSubmit, handleKeyDown, dismissError, clearChat, runQuery,
        confirmAutoPay,
    };
};
