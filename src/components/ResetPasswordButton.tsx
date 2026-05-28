"use client";

import { useState } from "react";
import { resetPatientPassword } from "@/lib/actions";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResetPasswordButtonProps {
    patientId: string;
}

export function ResetPasswordButton({ patientId }: ResetPasswordButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const handleReset = async () => {
        if (!confirm("Tem certeza de que deseja resetar a senha deste paciente para a senha padrão 'psicologa123'?\nO paciente será obrigado a cadastrar uma nova senha no próximo acesso.")) {
            return;
        }
        setIsPending(true);
        try {
            const res = await resetPatientPassword(patientId);
            if (res.success) {
                toast.success("Senha redefinida para 'psicologa123' com sucesso!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao resetar a senha do paciente.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="w-full h-9 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold text-[9px] uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-1.5 border border-rose-500/10 hover:border-rose-500/20"
        >
            {isPending ? (
                <Loader2 size={11} className="animate-spin text-rose-400" />
            ) : (
                <KeyRound size={11} className="text-rose-400 shrink-0" />
            )}
            Resetar Senha
        </Button>
    );
}
