"use client";

import { useState } from "react";
import { setAbsent } from "@/lib/actions";
import { Loader2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AbsentButtonProps {
    appointmentId: string;
    variant?: "ghost" | "outline" | "default";
    className?: string;
}

export function AbsentButton({ appointmentId, variant = "ghost", className }: AbsentButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const handleAbsent = async () => {
        if (!confirm("Marcar este paciente como ausente?")) return;
        setIsPending(true);
        try {
            await setAbsent(appointmentId);
        } catch (error) {
            console.error("Erro ao marcar ausência:", error);
            alert("Erro ao processar solicitação.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={handleAbsent}
            disabled={isPending}
            className={cn("h-9 px-4 rounded-[1.2rem] text-stone-400 hover:text-amber-600 hover:bg-amber-50 font-black text-[9px] uppercase tracking-wider transition-all", className)}
        >
            {isPending ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <UserMinus size={12} className="mr-1.5" />
            )}
            Ausente
        </Button>
    );
}
