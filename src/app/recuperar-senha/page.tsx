"use client";

import { useState, useEffect } from "react";
import { forgotPassword, resetPassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, CheckCircle2, ArrowLeft, Key } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PasswordRecoveryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [mode, setMode] = useState<"REQUEST" | "RESET">("REQUEST");

    useEffect(() => {
        if (token) setMode("RESET");
    }, [token]);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Tentamos como psicóloga primeiro, depois paciente (ou pedimos pro usuário escolher, 
            // mas aqui tentaremos o fluxo mais comum de paciente se não houver erro específico)
            const result = await forgotPassword(email, "PATIENT");
            if (result.success) {
                setSuccess(true);
                toast.success("E-mail enviado!");
            } else {
                // Tenta como psicóloga
                const adminResult = await forgotPassword(email, "PSYCHOLOGIST");
                if (adminResult.success) {
                    setSuccess(true);
                    toast.success("E-mail enviado!");
                } else {
                    toast.error("E-mail não encontrado no sistema.");
                }
            }
        } catch (error) {
            toast.error("Erro ao solicitar recuperação.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        setLoading(true);
        try {
            const result = await resetPassword(token as string, newPassword);
            if (result.success) {
                toast.success("Senha alterada com sucesso!");
                router.push("/paciente/login");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao redefinir senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-stone-200/30 border border-stone-100">
                    
                    <Link href="/paciente/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors mb-10">
                        <ArrowLeft size={14} /> Voltar para o Login
                    </Link>

                    {success ? (
                        <div className="text-center py-10 space-y-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-serif italic text-stone-800">Verifique seu e-mail</h2>
                            <p className="text-sm text-stone-500 leading-relaxed">
                                Enviamos as instruções de recuperação para <strong>{email}</strong>. 
                                Não esqueça de verificar a pasta de spam.
                            </p>
                            <Button variant="outline" onClick={() => setSuccess(false)} className="rounded-xl border-stone-100 text-stone-400 hover:bg-stone-50 h-12 px-8 uppercase text-[10px] font-black tracking-widest">
                                Tentar outro e-mail
                            </Button>
                        </div>
                    ) : mode === "REQUEST" ? (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-serif italic text-stone-800 mb-3">Recuperar Senha</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Enviaremos um link seguro para seu e-mail</p>
                            </div>
                            <form onSubmit={handleRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail Cadastrado</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                        <Input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#94A694]/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Enviar Link de Recuperação"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 rounded-full bg-[#94A694]/10 flex items-center justify-center mx-auto mb-6 text-[#94A694]">
                                    <Key size={28} />
                                </div>
                                <h1 className="text-3xl font-serif italic text-stone-800 mb-3">Nova Senha</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Escolha uma senha forte para sua segurança</p>
                            </div>
                            <form onSubmit={handleReset} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Nova Senha</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <Input 
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Confirmar Senha</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                            <Input 
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-stone-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Redefinir e Entrar"}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
