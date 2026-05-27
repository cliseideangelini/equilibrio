"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Phone, Lock, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePatientProfile } from "@/lib/actions";

export default function PatientProfilePage({ patient }: { patient: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState(patient.name);
    const [email, setEmail] = useState(patient.email || "");
    const [newPassword, setNewPassword] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updatePatientProfile({
                name,
                email,
                password: newPassword || undefined
            });
            if (result.success) {
                toast.success("Perfil atualizado com sucesso!");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Link href="/paciente/minha-agenda" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mb-10 group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
                Voltar para Agenda
            </Link>

            <div className="glass-card rounded-[3rem] p-10 border border-white/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />
                
                <div className="mb-12 relative z-10">
                    <h1 className="text-4xl font-serif text-white mb-2 tracking-tight">Meu <span className="italic text-primary">Perfil</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gerencie seus dados e segurança</p>
                </div>

                <form onSubmit={handleSave} className="space-y-8 relative z-10">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail (Para Recuperação)</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp (Não Editável)</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <Input 
                                    value={patient.phone}
                                    disabled
                                    className="h-14 pl-12 rounded-2xl border-white/5 bg-black/40 text-white/40 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nova Senha (Opcional)</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-14 pl-12 rounded-2xl border-white/10 bg-white/5 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <p className="text-[9px] text-muted-foreground italic font-medium ml-1">Deixe em branco para manter a senha atual.</p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-15 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-glow hover:shadow-glow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 py-7 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-glow"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Save size={18} />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
