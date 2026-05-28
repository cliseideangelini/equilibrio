"use client";

import { useState } from "react";
import { registerPatient } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Lock, ArrowRight, MessageSquare, UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function PatientRegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/paciente/minha-agenda";
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Dummy date of birth and phone as username required by action
            const result = await registerPatient({
                name,
                phone,
                password,
                username: phone.replace(/\D/g, ''),
                dateOfBirth: new Date().toISOString()
            });
            
            if (result.success) {
                toast.success("Conta criada e login realizado com sucesso!");
                router.push(redirectTo);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao realizar cadastro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden text-foreground">
            {/* Cinematic Aurora Background */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emeraldGlow-500/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Header Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-3 mb-4 group">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-all shadow-md">
                            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain shrink-0 invert opacity-90" />
                        </div>
                        <span className="font-serif text-2xl text-foreground tracking-wide leading-none">Equilíbrio</span>
                    </Link>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Conexão Segura & Criptografada</p>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 border border-white/10 bg-black/40 backdrop-blur-2xl shadow-dim-lg">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)]">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Criar Conta</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Portal do Paciente</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <Input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nome e Sobrenome"
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 focus:ring-primary/20 text-white placeholder-white/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <Input 
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 focus:ring-primary/20 text-white placeholder-white/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Criar Senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <Input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 4 dígitos"
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 focus:ring-primary/20 text-white placeholder-white/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-15 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group py-7"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Cadastrar e Continuar
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/10 text-center space-y-4">
                        <p className="text-[10px] text-muted-foreground font-medium">Já possui uma conta?</p>
                        <Link href={`/paciente/login${redirectTo !== "/paciente/minha-agenda" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors">
                            Fazer Login
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                        Voltar para o Início
                    </Link>
                </div>
            </div>
        </div>
    );
}

