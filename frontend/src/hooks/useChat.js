// ── Chat + payment flow logic ──────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { queryAgent, verifyPayment } from "../services/api";

export const STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    PAYMENT_REQUIRED: "payment_required",
    SENDING_PAYMENT: "sending_payment",
    TX_PENDING: "tx_pending",
    VERIFYING: "verifying",
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

    const { sendTransaction, data: sendTxData, error: sendError } =
        useSendTransaction();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: sendTxData,
    });

    // Auto-scroll to bottom on new messages or status changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, status]);

    // Tx sent → pending
    useEffect(() => {
        if (sendTxData) setStatus(STATUS.TX_PENDING);
    }, [sendTxData]);

    // Tx error
    useEffect(() => {
        if (sendError) {
            setError(sendError.shortMessage || sendError.message || "Transaction rejected.");
            setStatus(STATUS.ERROR);
        }
    }, [sendError]);

    // Tx confirmed → verify
    useEffect(() => {
        if (isConfirmed && sendTxData && address) {
            verifyOnChain(sendTxData);
        }
    }, [isConfirmed, sendTxData, address]);

    const verifyOnChain = async (hash) => {
        setStatus(STATUS.VERIFYING);
        try {
            const result = await verifyPayment(hash, address);
            if (result.status === "payment_verified") {
                addMessage("system", "✅ Payment verified! Processing your query...");
                if (pendingQuery) setTimeout(() => runQuery(pendingQuery), 300);
            } else {
                setError(result.message || "Verification failed.");
                setStatus(STATUS.ERROR);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Verification failed.");
            setStatus(STATUS.ERROR);
        }
    };

    const addMessage = (role, content, data) => {
        setMessages((prev) => [...prev, { role, content, ...(data && { data }) }]);
    };

    const runQuery = async (q) => {
        setStatus(STATUS.ANALYZING);
        setError(null);
        try {
            const result = await queryAgent(q, address);
            const d = result.data;
            addMessage("assistant", d.aiAnalysis, {
                ethPrice: d.ethPrice,
                gasPrices: d.gasPrices,
                model: d.model,
                timestamp: d.timestamp,
            });
            setStatus(STATUS.SUCCESS);
            setPendingQuery(null);
        } catch (err) {
            if (err.response?.status === 402) {
                setPaymentInfo(err.response.data);
                setPendingQuery(q);
                setStatus(STATUS.PAYMENT_REQUIRED);
                addMessage("system", `💳 Payment required: **${err.response.data.amount}** on Sepolia to access AI agent.`);
                return;
            }
            setError(err.response?.data?.message || err.message || "Query failed.");
            setStatus(STATUS.ERROR);
        }
    };

    const handleSubmit = useCallback(
        (e) => {
            e?.preventDefault();
            if (!query.trim() || !address) return;
            addMessage("user", query.trim());
            setQuery("");
            setError(null);
            setStatus(STATUS.LOADING);
            runQuery(query.trim());
        },
        [query, address]
    );

    const handlePayment = useCallback(() => {
        if (!paymentInfo) return;
        setStatus(STATUS.SENDING_PAYMENT);
        setError(null);
        sendTransaction({
            to: paymentInfo.payment_address,
            value: parseEther("0.001"),
        });
    }, [paymentInfo, sendTransaction]);

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

    return {
        // State
        address, isConnected, query, setQuery, status, messages,
        paymentInfo, error, sendTxData, messagesEndRef,
        // Actions
        handleSubmit, handlePayment, handleKeyDown, dismissError,
    };
};
