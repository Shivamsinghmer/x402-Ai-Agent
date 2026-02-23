// ── Theme hook with localStorage persistence ──────────────────
import { useState, useEffect } from "react";

export const useTheme = () => {
    const [dark, setDark] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("x402-theme") === "dark";
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem("x402-theme", dark ? "dark" : "light");
    }, [dark]);

    const toggle = () => setDark((d) => !d);

    // Precomputed class tokens
    const t = {
        dark,
        bg: dark ? "bg-gray-950" : "bg-white",
        bgSecondary: dark ? "bg-gray-900" : "bg-gray-50",
        text: dark ? "text-gray-100" : "text-gray-900",
        textMuted: dark ? "text-gray-400" : "text-gray-500",
        textFaint: dark ? "text-gray-500" : "text-gray-400",
        border: dark ? "border-gray-800" : "border-gray-200",
        inputBg: dark
            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400",
        inputFocus: dark
            ? "focus:ring-gray-600 focus:border-gray-600"
            : "focus:ring-gray-300 focus:border-gray-400",
        userBubble: dark ? "bg-gray-700 text-gray-100" : "bg-gray-900 text-white",
        aiBadge: dark ? "bg-gray-800" : "bg-gray-900",
        spinnerAccent: dark ? "border-t-gray-100" : "border-t-gray-900",
        statusPill: dark
            ? "bg-gray-800 border-gray-700 text-gray-400"
            : "bg-gray-50 border-gray-100 text-gray-500",
        shadow: dark ? "shadow-gray-900" : "shadow-gray-300",
        markdown: dark ? "ai-markdown-dark" : "ai-markdown",
        chip: dark
            ? "text-gray-300 bg-gray-800 hover:bg-gray-700 border-gray-700"
            : "text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200",
        sendBtn: dark
            ? "bg-gray-100 text-gray-900 hover:bg-white"
            : "bg-gray-900 text-white hover:bg-gray-800",
        sendSpinner: dark
            ? "border-gray-400 border-t-gray-900"
            : "border-white/30 border-t-white",
        pill: (lightBg, lightText, lightBorder, darkBg, darkText, darkBorder) =>
            dark
                ? `${darkBg} ${darkText} ${darkBorder}`
                : `${lightBg} ${lightText} ${lightBorder}`,
    };

    return { toggle, t };
};
