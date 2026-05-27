"use client";

import { useState } from "react";
import { loginPatient, loginPsychologist } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, ArrowRight, Phone, MessageSquare, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function UnifiedLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Configurações de Redirecionamento
    const redirectTo = searchParams.get("redirect") || "/paciente/minha-agenda";
    const initialRole = searchParams.get("role") === "professional" ? "professional" : "patient";

    const [role, setRole] = useState<"patient" | "professional">(initialRole);
    const [loading, setLoading] = useState(false);
    
    // States do Paciente
    const [phone, setPhone] = useState("");
    
    // States do Profissional
    const [email, setEmail] = useState("");
    
    // Senha comum
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === "patient") {
                const result = await loginPatient(phone, password);
                if (result.success) {
                    toast.success("Bem-vindo de volta!");
                    router.push(redirectTo);
                } else {
                    toast.error(result.error);
                }
            } else {
                const result = await loginPsychologist(email, password);
                if (result.success) {
                    toast.success("Acesso administrativo autorizado!");
                    router.push("/area-clinica");
                } else {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            toast.error("Erro ao realizar login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121312] text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* Cinematic Aurora Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emeraldGlow-500/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Logo / Header */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-3 mb-4 group">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-all shadow-md">
                            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain shrink-0 invert opacity-90" />
                        </div>
                        <span className="font-serif text-2xl text-foreground tracking-wide leading-none">Equilíbrio</span>
                    </Link>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Conexão Segura & Criptografada</p>
                </div>

                {/* Main Card */}
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/10 bg-black/40 backdrop-blur-2xl shadow-dim-lg">
                    
                    {/* Tab Switcher */}
                    <div className="grid grid-cols-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 mb-8">
                        <button
                            type="button"
                            onClick={() => { setRole("patient"); setPassword(""); }}
                            className={cn(
                                "py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                                role === "patient" 
                                    ? "bg-primary text-white shadow-lg" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <User size={14} />
                            Paciente
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole("professional"); setPassword(""); }}
                            className={cn(
                                "py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2",
                                role === "professional" 
                                    ? "bg-primary text-white shadow-lg" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShieldCheck size={14} />
                            Profissional
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {role === "patient" ? (
                            // Campos do Paciente
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
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
                        ) : (
                            // Campos do Profissional
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Usuário Profissional</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <Input 
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Seu usuário ou e-mail"
                                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 focus:ring-primary/20 text-white placeholder-white/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Senha</label>
                                <Link 
                                    href="/recuperar-senha" 
                                    className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <Input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 focus:bg-white/10 focus:ring-primary/20 text-white placeholder-white/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-15 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 group py-7"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {role === "patient" ? "Acessar Consultas" : "Entrar no Painel"}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {role === "patient" && (
                        <div className="mt-10 pt-10 border-t border-white/5 text-center space-y-4">
                            <p className="text-[10px] text-muted-foreground font-medium">Ainda não tem uma conta?</p>
                            <Link 
                                href={`/paciente/cadastro${redirectTo !== "/paciente/minha-agenda" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} 
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-colors"
                            >
                                Criar Conta e Agendar
                                <ArrowRight size={12} />
                            </Link>
                        </div>
                    )}
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
