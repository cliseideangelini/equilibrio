"use client";

import { useState } from "react";
import { LogOut, Home, LogOut as LogOutIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false);

    if (isOpen) {
        return (
            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col gap-3 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Opções de Saída</span>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-10 rounded-xl bg-white hover:bg-sage-50 text-foreground border-sage-200"
                    onClick={() => window.location.href = "/"}
                >
                    <Home size={16} className="text-sage-500" />
                    Ir para o Início
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 rounded-xl bg-red-100/50 hover:bg-red-500 hover:text-white text-red-600 border-transparent transition-all"
                    onClick={() => {
                        document.cookie = "patient_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        window.location.href = "/paciente/login";
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
            className="w-full justify-start gap-3 h-12 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-50 transition-all font-bold"
        >
            <LogOut size={20} />
            Sair da Agenda
        </Button>
    );
}
