"use client";

import { useState } from "react";
import { revertAppointmentStatus } from "@/lib/actions";
import { Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RevertStatusButtonProps {
    appointmentId: string;
}

export function RevertStatusButton({ appointmentId }: RevertStatusButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const handleRevert = async () => {
        setIsPending(true);
        try {
            await revertAppointmentStatus(appointmentId);
        } catch (error) {
            console.error("Erro ao desfazer:", error);
            alert("Erro ao desfazer o status da consulta.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRevert}
            disabled={isPending}
            className="h-8 w-8 p-0 rounded-full text-muted-fg hover:text-amber-500 hover:bg-amber-500/10 transition-all ml-2"
            title="Desfazer Ação"
        >
            {isPending ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <Undo2 size={12} />
            )}
        </Button>
    );
}
