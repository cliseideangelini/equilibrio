"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmAppointment } from "@/lib/actions";
import { Loader2 } from "lucide-react";

interface ConfirmAppointmentButtonProps {
    appointmentId: string;
}

export function ConfirmAppointmentButton({ appointmentId }: ConfirmAppointmentButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsPending(true);
        try {
            const result = await confirmAppointment(appointmentId);
            if (result.success) {
                // Redirecionar para o prontuário do paciente
                router.push(`/area-clinica/prontuarios/${result.patientId}`);
            }
        } catch (error) {
            console.error("Erro ao confirmar:", error);
            alert("Erro ao confirmar agendamento.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleConfirm}
            disabled={isPending}
            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
            {isPending && <Loader2 size={10} className="animate-spin" />}
            Confirmar
        </button>
    );
}
