"use client";

import { useState } from "react";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleSchedulePause } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
    adminId: string;
    isPaused: boolean;
}

export function PauseScheduleButton({ adminId, isPaused: initialPaused }: Props) {
    const [loading, setLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(initialPaused);

    const handleToggle = async () => {
        const action = isPaused ? "destravar" : "travar";
        if (!window.confirm(`Tem certeza que deseja ${action} a agenda para novos agendamentos?`)) {
            return;
        }

        setLoading(true);
        try {
            const result = await toggleSchedulePause(adminId, !isPaused);
            if (result.success) {
                setIsPaused(!isPaused);
                toast.success(`Agenda ${!isPaused ? 'travada' : 'destravada'} com sucesso!`);
            } else {
                toast.error(result.error || "Erro ao alterar o status da agenda.");
            }
        } catch (e) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl border",
                isPaused 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 shadow-[0_0_15px_-4px_rgba(244,63,94,0.35)]" 
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
            )}
            title={isPaused ? "Destravar Agenda" : "Travar Agenda"}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isPaused ? (
                <Lock size={16} />
            ) : (
                <Unlock size={16} />
            )}
            {isPaused ? "Agenda Travada" : "Travar Agenda"}
        </button>
    );
}
