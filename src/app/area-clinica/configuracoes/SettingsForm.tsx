"use client";

import { useState } from "react";
import { updatePsychologistProfile } from "@/lib/actions";
import { User, Mail, Award, Phone, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
    psychologist: {
        name: string;
        email: string;
        crp: string;
        phone: string;
    };
}

export function SettingsForm({ psychologist }: SettingsFormProps) {
    const [name, setName] = useState(psychologist.name);
    const [email, setEmail] = useState(psychologist.email);
    const [crp, setCrp] = useState(psychologist.crp);
    const [phone, setPhone] = useState(psychologist.phone);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            const result = await updatePsychologistProfile({
                name,
                email,
                crp,
                phone
            });
            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar dados.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Nome */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg px-1">Nome Completo</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg w-4 h-4" />
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        placeholder="Seu nome profissional..."
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg px-1">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg w-4 h-4" />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        placeholder="email@exemplo.com"
                    />
                </div>
            </div>

            {/* CRP */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg px-1">Registro Profissional (CRP)</label>
                <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg w-4 h-4" />
                    <input
                        type="text"
                        required
                        value={crp}
                        onChange={(e) => setCrp(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        placeholder="CRP 00/00000"
                    />
                </div>
            </div>

            {/* WhatsApp para Notificações */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">WhatsApp para Notificações</label>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Ativo</span>
                </div>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-primary/20 rounded-2xl text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-[0_0_15px_-4px_rgba(29,184,127,0.15)]"
                        placeholder="DDD + Número (ex: 199988275290)"
                    />
                </div>
                <p className="text-[10px] text-muted-fg px-1">
                    Insira o número completo com DDD (ex: <code className="text-foreground font-mono">199988275290</code>) para receber as notificações.
                </p>
            </div>

            {/* Mensagem de Feedback */}
            {success && (
                <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-sm animate-in fade-in duration-300">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Configurações salvas e atualizadas com sucesso!</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm animate-in fade-in duration-300">
                    {error}
                </div>
            )}

            {/* Botão de Envio */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    "Salvar Alterações"
                )}
            </Button>
        </form>
    );
}
