"use client";

import { useState, useEffect } from "react";
import { Smartphone, QrCode, CheckCircle2, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";

export function WhatsAppConnectionCard() {
    const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
    const [qrCode, setQrCode] = useState<string | null>(null);

    const checkStatus = async () => {
        try {
            const res = await fetch("https://equilibrio-whatsapp-bridge.onrender.com/status");
            const data = await res.json();
            
            if (data.connected) {
                setStatus("connected");
                setQrCode(null);
            } else {
                setStatus("disconnected");
                fetchQrCode();
            }
        } catch (error) {
            console.error("Erro ao verificar status do WhatsApp:", error);
            setStatus("disconnected");
        }
    };

    const fetchQrCode = async () => {
        try {
            const res = await fetch("https://equilibrio-whatsapp-bridge.onrender.com/qr");
            const data = await res.json();
            if (data.qr) {
                setQrCode(data.qr);
            }
        } catch (error) {
            console.error("Erro ao buscar QR Code:", error);
        }
    };

    const handleLogout = async () => {
        setStatus("loading");
        try {
            await fetch("https://equilibrio-whatsapp-bridge.onrender.com/logout", { method: "POST" });
            // Espera um segundo para o backend reiniciar a sessão
            setTimeout(checkStatus, 2000);
        } catch (error) {
            console.error("Erro ao desconectar:", error);
            checkStatus();
        }
    };

    // Polling a cada 8 segundos para atualizar o status/QR
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-surface/50 border border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                {status === "connected" ? <CheckCircle2 className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
            </div>
            
            <h3 className="text-xl font-bold text-foreground">
                Conexão do WhatsApp
            </h3>
            
            <p className="text-sm text-muted-fg max-w-sm">
                Conecte o celular da clínica para que o sistema possa enviar mensagens automáticas de agendamento para os pacientes e para você.
            </p>

            <div className="w-full max-w-xs mt-4">
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-xl">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-sm text-muted-fg">Verificando conexão...</p>
                    </div>
                )}

                {status === "disconnected" && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg">
                        {qrCode ? (
                            <Image src={qrCode} alt="WhatsApp QR Code" width={256} height={256} className="rounded-lg" />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8">
                                <QrCode className="w-8 h-8 text-muted-fg animate-pulse mb-4" />
                                <p className="text-sm text-muted-fg">Gerando QR Code...</p>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Abra o WhatsApp no celular, vá em <b>Aparelhos Conectados</b> e escaneie este código.
                        </p>
                    </div>
                )}

                {status === "connected" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Aparelho Conectado e Pronto!
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors px-4 py-2"
                            type="button"
                        >
                            <LogOut className="w-4 h-4" />
                            Desconectar Aparelho
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
