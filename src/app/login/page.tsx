"use client";

import { useState } from "react";
import { loginPsychologist } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await loginPsychologist(email, password);
            if (result.success) {
                toast.success("Login realizado com sucesso!");
                router.push("/area-clinica");
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
            {/* Background Decorative */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-[#94A694]/5 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[#F2E8DF]/20 blur-[120px]" />
            </div>

            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-full bg-[#94A694]/10 flex items-center justify-center mx-auto mb-6">
                            <Lock className="text-[#94A694]" size={28} />
                        </div>
                        <h1 className="text-3xl font-serif italic text-stone-800 mb-2">Área Clínica</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Portal Administrativo</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail Profissional</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Senha</label>
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
                            className="w-full h-14 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#94A694]/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Entrar no Painel
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-[10px] font-bold text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-widest">
                            Voltar para o site
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
