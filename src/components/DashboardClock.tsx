"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function DashboardClock() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const formatted = now.toLocaleTimeString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            setTime(formatted);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Suppress server side hydration flash
    if (!time) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-muted-fg/40 border border-border/30 backdrop-blur-md transition-all">
                <Clock className="w-3 h-3 text-muted-fg/40" />
                --:--:--
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-muted-fg border border-border/40 backdrop-blur-md transition-all shadow-sm">
            <Clock className="w-3 h-3 text-primary animate-pulse" />
            {time}
        </span>
    );
}
