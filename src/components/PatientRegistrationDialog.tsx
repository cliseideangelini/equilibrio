"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Phone, User, Mail } from "lucide-react";
import { registerPatient } from "@/lib/actions";

export function PatientRegistrationDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const cleanUsername = formData.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "") + randomSuffix;

            await registerPatient({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                username: cleanUsername,
                dateOfBirth: "2000-01-01",
                generateTempPassword: true, // Senha temporária gerada e enviada por WhatsApp
            });
            setIsOpen(false);
            setFormData({ name: "", phone: "", email: "" });
            window.location.reload();
        } catch (error: any) {
            alert(error.message || "Erro ao cadastrar paciente.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 px-8 rounded-2xl bg-stone-900 border-0 text-white hover:bg-stone-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200 gap-2">
                    <UserPlus size={14} /> Novo Paciente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-stone-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-stone-900 tracking-tight">
                        Cadastrar <span className="italic font-serif text-stone-500">Novo Paciente</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleRegister} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Ana Silva..."
                                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="11 99999-0000"
                                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">E-mail (Opcional)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ana@email.com"
                                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 rounded-2xl bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl shadow-stone-100 mt-4"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Salvar Cadastro"}
                    </Button>
                    <p className="text-[9px] text-center text-stone-400 uppercase tracking-widest leading-relaxed px-4">
                        Uma senha temporária será gerada e enviada automaticamente para o paciente por WhatsApp
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
