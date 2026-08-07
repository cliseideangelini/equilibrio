"use client";

import { useState, useEffect } from "react";
import { MessageCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppStatusIndicator() {
    const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");

    const checkStatus = async () => {
        try {
            const res = await fetch("https://equilibrio-whatsapp-bridge.onrender.com/status");
            const data = await res.json();
            if (data.connected) {
                setStatus("connected");
            } else {
                setStatus("disconnected");
            }
        } catch (error) {
            setStatus("disconnected");
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 20000);
        return () => clearInterval(interval);
    }, []);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 animate-pulse" title="Verificando WhatsApp...">
                <MessageCircle size={12} className="text-muted-foreground" />
            </div>
        );
    }

    return (
        <div 
            className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full border transition-all",
                status === "connected" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500 cursor-pointer"
            )}
            title={status === "connected" ? "WhatsApp Conectado" : "WhatsApp Desconectado (Clique para conectar)"}
            onClick={() => {
                if (status === "disconnected") {
                    window.location.href = "/area-clinica/configuracoes";
                }
            }}
        >
            {status === "connected" ? (
                <MessageCircle size={12} />
            ) : (
                <XCircle size={12} />
            )}
        </div>
    );
}
