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
    isProfessional?: boolean;
}

export function CancellationButton({ appointmentId, startTime, variant = "ghost", className, isProfessional }: CancellationButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const now = new Date();
    const appTime = new Date(startTime);
    const hoursUntilSession = (appTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLate = !isProfessional && hoursUntilSession <= 3 && hoursUntilSession > 0;

    const handleCancel = async (confirmLate: boolean = false) => {
        setIsPending(true);
        try {
            const result = await cancelAppointment(appointmentId, confirmLate, isProfessional);

            if (result.success) {
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
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-white/10 bg-zinc-950 text-white backdrop-blur-2xl shadow-2xl">
                <DialogHeader>
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-4 border",
                        isLate 
                            ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                        <AlertCircle size={24} />
                    </div>
                    <DialogTitle className="text-xl font-serif text-white tracking-tight">Cancelar Sessão</DialogTitle>
                    <DialogDescription className="text-stone-400 text-sm leading-relaxed mt-2" id="cancellation-desc">
                        {isLate ? (
                            <span className="text-red-400 font-bold block bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl leading-relaxed">
                                Atenção: Faltam menos de 3h para o início. Cancelamentos com menos de 3 horas de antecedência serão cobrados integralmente.
                            </span>
                        ) : (
                            "Você tem certeza que deseja cancelar este agendamento?"
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl flex-1 border-white/10 hover:bg-white/5 text-stone-300">
                        Não, manter
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleCancel(isLate)}
                        disabled={isPending}
                        className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : isLate ? "Sim, ciente da cobrança" : "Confirmar Cancelamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
