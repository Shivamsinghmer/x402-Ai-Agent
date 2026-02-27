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
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    const toggle = () => setDark((d) => !d);

    // Precomputed class tokens
    const t = {
        dark,
        bg: dark ? "bg-[#050505]" : "bg-[#fcfdfd]", // Deep black vs clean white
        bgSecondary: dark ? "bg-emerald-950/20" : "bg-emerald-50/50",
        text: dark ? "text-slate-100" : "text-slate-900",
        textMuted: dark ? "text-slate-400" : "text-slate-500",
        textFaint: dark ? "text-slate-500" : "text-slate-400",
        border: dark ? "border-white/5" : "border-slate-200",
        inputBg: dark
            ? "bg-transparent border-white/10 text-slate-100 placeholder-slate-500"
            : "bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400",
        inputFocus: dark
            ? "focus:ring-emerald-500/20 focus:border-emerald-500/50"
            : "focus:ring-emerald-500/20 focus:border-emerald-500/30",
        userBubble: dark ? "bg-emerald-600 text-white" : "bg-slate-900 text-white",
        aiBadge: dark ? "bg-emerald-900/50" : "bg-slate-900",
        spinnerAccent: dark ? "border-t-emerald-400" : "border-t-emerald-600",
        statusPill: dark
            ? "bg-slate-900/60 border-white/5 text-slate-400"
            : "bg-slate-100/60 border-slate-200 text-slate-600",
        shadow: dark ? "shadow-[0_0_40px_rgba(0,0,0,0.8)]" : "shadow-lg",
        markdown: dark ? "ai-markdown-dark" : "ai-markdown",
        chip: dark
            ? "text-slate-300 hover:bg-white/5 border-white/5"
            : "text-slate-600 hover:bg-black/5 border-slate-200",
        sendBtn: dark
            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            : "bg-slate-900 text-white hover:bg-slate-800",
        sendSpinner: dark
            ? "border-slate-900/30 border-t-slate-900"
            : "border-white/30 border-t-white",
        pill: (lightBg, lightText, lightBorder, darkBg, darkText, darkBorder) =>
            dark
                ? `${darkBg} ${darkText} ${darkBorder}`
                : `${lightBg} ${lightText} ${lightBorder}`,
    };

    return { toggle, t };
};
