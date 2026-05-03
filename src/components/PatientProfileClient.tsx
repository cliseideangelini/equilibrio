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
            <Link href="/paciente/minha-agenda" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors mb-10">
                <ArrowLeft size={14} /> Voltar para Agenda
            </Link>

            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-stone-200/40 border border-stone-50">
                <div className="mb-12">
                    <h1 className="text-4xl font-serif italic text-stone-800 mb-2">Meu Perfil</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Gerencie seus dados e segurança</p>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail (Para Recuperação)</label>
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">WhatsApp (Não Editável)</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    value={patient.phone}
                                    disabled
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/10 text-stone-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-50">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Nova Senha (Opcional)</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <Input 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    />
                                </div>
                                <p className="text-[9px] text-stone-400 italic">Deixe em branco para manter a senha atual.</p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-15 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#94A694]/20 transition-all flex items-center justify-center gap-2 py-7"
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
