"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, XCircle } from "lucide-react";
import { cancelAppointment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CancellationButtonProps {
    appointmentId: string;
    startTime: string;
    variant?: "ghost" | "outline" | "default";
    className?: string;
}

export function CancellationButton({ appointmentId, startTime, variant = "ghost", className }: CancellationButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [requiresLateConfirmation, setRequiresLateConfirmation] = useState(false);
    const router = useRouter();

    const handleCancel = async (confirmLate: boolean = false) => {
        setIsPending(true);
        try {
            const result = await cancelAppointment(appointmentId, confirmLate);

            if (result.requiresConfirmation) {
                setRequiresLateConfirmation(true);
            } else if (result.success) {
                setIsOpen(false);
                window.location.reload();
            }
        } catch (error: any) {
            console.error("Erro ao cancelar:", error);
            alert("Erro ao cancelar: " + (error.message || "Tente novamente."));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size="sm" className={cn("text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl px-4", className)}>
                    <XCircle className="w-4 h-4 mr-2" /> Cancelar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                <DialogHeader>
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <DialogTitle className="text-xl font-bold">Cancelar Sessão</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {requiresLateConfirmation
                            ? "Atenção: Como faltam menos de 3h para o início, o valor da sessão será cobrado conforme as regras da clínica."
                            : "Você tem certeza que deseja cancelar este agendamento?"}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1">
                        Não, manter
                    </Button>
                    {requiresLateConfirmation ? (
                        <Button
                            variant="destructive"
                            onClick={() => handleCancel(true)}
                            disabled={isPending}
                            className="rounded-xl flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Sim, ciente da cobrança"}
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => handleCancel(false)}
                            disabled={isPending}
                            className="rounded-xl flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar Cancelamento"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
