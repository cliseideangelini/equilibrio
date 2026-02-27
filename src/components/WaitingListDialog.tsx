"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToWaitingList } from "@/lib/actions";
import { Loader2, CalendarHeart, CheckCircle2 } from "lucide-react";

export function WaitingListDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        preferredDays: "",
        preferredHours: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        setIsPending(true);
        try {
            await addToWaitingList(formData);
            setIsSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setIsSuccess(false);
            }, 3000);
            setFormData({ name: "", phone: "", email: "", preferredDays: "", preferredHours: "" });
        } catch (error) {
            console.error("Error joining waiting list:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-col items-center gap-4 p-8 bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200 cursor-pointer hover:bg-stone-100 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm">
                        <CalendarHeart size={24} />
                    </div>
                    <div className="text-center">
                        <h4 className="text-sm font-bold text-stone-800">Não encontrou um horário?</h4>
                        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest mt-1">Entre na nossa lista de espera</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-stone-200 text-[10px] font-black uppercase tracking-widest">
                        Quero ser avisado
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-light text-stone-900">Lista de <span className="italic font-serif">Espera</span></DialogTitle>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">
                            Avisaremos você via WhatsApp assim que surgir uma vaga.
                        </p>
                    </DialogHeader>

                    {isSuccess ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-stone-800 font-bold">Inscrito com sucesso!</h4>
                                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest mt-1">Avisaremos assim que um horário liberar.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 py-6">
                                <div className="grid gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 px-1">Nome Completo</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Seu nome"
                                        className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 px-1">WhatsApp</label>
                                    <Input
                                        required
                                        value={formData.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 px-1">Dias Preferidos</label>
                                        <Input
                                            value={formData.preferredDays}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredDays: e.target.value })}
                                            placeholder="Ex: Seg, Ter"
                                            className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 px-1">Período</label>
                                        <Input
                                            value={formData.preferredHours}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredHours: e.target.value })}
                                            placeholder="Ex: Manhã"
                                            className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-stone-900 text-white rounded-xl h-12 font-bold text-xs uppercase tracking-[0.15em]"
                                >
                                    {isPending ? <Loader2 size={16} className="animate-spin" /> : "Confirmar na Lista de Espera"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
