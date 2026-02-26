"use client";

import { useState } from "react";
import { completeAppointment } from "@/lib/actions";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompleteAppointmentButtonProps {
    appointmentId: string;
}

export function CompleteAppointmentButton({ appointmentId }: CompleteAppointmentButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const handleComplete = async () => {
        setIsPending(true);
        try {
            await completeAppointment(appointmentId);
        } catch (error) {
            console.error("Erro ao finalizar:", error);
            alert("Erro ao finalizar consulta.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            disabled={isPending}
            className="h-9 px-4 rounded-[1.2rem] text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 font-black text-[9px] uppercase tracking-wider transition-all"
        >
            {isPending ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <CheckCircle size={12} className="mr-1.5" />
            )}
            Finalizar
        </Button>
    );
}
