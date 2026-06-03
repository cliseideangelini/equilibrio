"use client";

import { useState } from "react";
import { LogOut, Home, LogOut as LogOutIcon, X } from "lucide-react";
import { logout } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false);

    if (isOpen) {
        return (
            <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col gap-3 animate-in fade-in zoom-in duration-300 w-56 relative z-50">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Opções de Saída</span>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 transition-all"
                    onClick={() => window.location.href = "/"}
                >
                    <Home size={16} className="text-primary" />
                    Ir para o Início
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border-transparent transition-all"
                    onClick={async () => {
                        if (window.confirm("Tem certeza que deseja deslogar da sua conta?")) {
                            await logout();
                            window.location.href = "/paciente/login";
                        }
                    }}
                >
                    <LogOutIcon size={16} />
                    Deslogar Conta
                </Button>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all font-bold"
        >
            <LogOut size={20} className="text-primary" />
            Sair da Agenda
        </Button>
    );
}
