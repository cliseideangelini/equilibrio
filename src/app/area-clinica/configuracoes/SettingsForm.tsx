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
        whatsappNotifications: boolean;
        whatsappNumber: string;
        whatsappApiKey: string;
    };
}

export function SettingsForm({ psychologist }: SettingsFormProps) {
    const [name, setName] = useState(psychologist.name);
    const [email, setEmail] = useState(psychologist.email);
    const [crp, setCrp] = useState(psychologist.crp);
    const [phone, setPhone] = useState(psychologist.phone);
    const [whatsappNotifications, setWhatsappNotifications] = useState(psychologist.whatsappNotifications);
    const [whatsappNumber, setWhatsappNumber] = useState(psychologist.whatsappNumber);
    const [whatsappApiKey, setWhatsappApiKey] = useState(psychologist.whatsappApiKey);
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
                phone,
                whatsappNotifications,
                whatsappNumber,
                whatsappApiKey
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

            {/* Configurações do CallMeBot (WhatsApp) */}
            <div className="space-y-4 p-5 bg-white/5 border border-primary/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            Notificações no WhatsApp (CallMeBot)
                        </h3>
                        <p className="text-[10px] text-muted-fg mt-1">
                            Receba alertas de novos agendamentos e cancelamentos no seu WhatsApp. 
                            <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">Veja como pegar sua API Key grátis.</a>
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={whatsappNotifications}
                            onChange={(e) => setWhatsappNotifications(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {whatsappNotifications && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg px-1">Número do WhatsApp</label>
                            <input
                                type="tel"
                                required={whatsappNotifications}
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full h-10 px-4 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: 199988275290 (com DDD)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg px-1">CallMeBot API Key</label>
                            <input
                                type="text"
                                required={whatsappNotifications}
                                value={whatsappApiKey}
                                onChange={(e) => setWhatsappApiKey(e.target.value)}
                                className="w-full h-10 px-4 bg-black/20 border border-white/10 rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                placeholder="Sua Chave do CallMeBot"
                            />
                        </div>
                    </div>
                )}
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
