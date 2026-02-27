"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { updatePatientPassword } from "@/lib/actions";

interface PasswordChangeDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    onSuccess: () => void;
}

export function PasswordChangeDialog({ isOpen, onOpenChange, patientId, onSuccess }: PasswordChangeDialogProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            return setError("A senha deve ter pelo menos 6 caracteres.");
        }

        if (newPassword !== confirmPassword) {
            return setError("As senhas não coincidem.");
        }

        setIsPending(true);
        try {
            await updatePatientPassword(patientId, newPassword);
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (err) {
            setError("Erro ao atualizar senha. Tente novamente.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-stone-900 tracking-tight">
                        Trocar <span className="text-stone-400 italic font-serif">Senha Padrão</span>
                    </DialogTitle>
                    <DialogDescription className="text-stone-500 font-medium leading-relaxed">
                        Como este é seu primeiro acesso com a senha fornecida pela clínica, por segurança, você deve escolher uma senha pessoal.
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={48} />
                        </div>
                        <h4 className="text-lg font-bold text-stone-800">Senha atualizada!</h4>
                        <p className="text-sm text-stone-400">Você será redirecionado para sua agenda...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="No mínimo 6 caracteres"
                                        className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-xs text-red-500 font-medium px-1">{error}</p>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 rounded-2xl bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl shadow-stone-100 mt-4"
                        >
                            {isPending ? <Loader2 className="animate-spin" /> : "Salvar Nova Senha"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
