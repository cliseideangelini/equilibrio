"use client";

import { useState } from "react";
import { loginPatient } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Lock, ArrowRight, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PatientLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await loginPatient(phone, password);
            if (result.success) {
                toast.success("Bem-vindo de volta!");
                router.push("/paciente/minha-agenda");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao realizar login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#F2E8DF]/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#94A694]/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-stone-200/30 border border-stone-50">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-serif italic text-stone-800 mb-3">Minha Agenda</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Portal do Paciente</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">WhatsApp</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sua Senha</label>
                                <Link href="/recuperar-senha" size="sm" className="text-[9px] font-bold text-[#94A694] hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-15 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#94A694]/20 transition-all flex items-center justify-center gap-2 group py-7"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Acessar Minhas Consultas
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-stone-50 text-center space-y-4">
                        <p className="text-[10px] text-stone-400 font-medium">Ainda não tem um horário marcado?</p>
                        <Link href="/agendar" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#94A694] hover:text-[#839583] transition-colors">
                            Agendar Primeira Sessão
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-[10px] font-bold text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest">
                        Voltar para o Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
