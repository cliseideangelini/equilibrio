"use client";

import { useState, useMemo } from "react";
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
import { Loader2, CalendarHeart, CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDay } from "date-fns";

interface AvailabilityRule {
    dayOfWeek: number;
    startTime: number;
    endTime: number;
}

interface WaitingListDialogProps {
    rules: AvailabilityRule[];
}

export function WaitingListDialog({ rules }: WaitingListDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mode, setMode] = useState<"general" | "specific">("general");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        preferredDays: "",
        preferredHours: "",
        specificDate: "",
        specificTime: ""
    });

    // Helper: Dias de atendimento (ex: [1, 2, 4])
    const workingDays = useMemo(() => Array.from(new Set(rules.map(r => r.dayOfWeek))), [rules]);

    // Helper: Horários para o dia selecionado
    const availableSlotsForDate = useMemo(() => {
        if (!formData.specificDate) return [];
        const date = new Date(formData.specificDate + "T00:00:00");
        const dayOfWeek = getDay(date);

        const dayRules = rules.filter(r => r.dayOfWeek === dayOfWeek);
        const slots: string[] = [];

        dayRules.forEach(rule => {
            let current = rule.startTime;
            while (current + 30 <= rule.endTime) {
                const h = Math.floor(current / 60);
                const m = current % 60;
                slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                current += 30;
            }
        });

        return slots.sort();
    }, [formData.specificDate, rules]);

    const isDayValid = useMemo(() => {
        if (!formData.specificDate) return true;
        const date = new Date(formData.specificDate + "T00:00:00");
        return workingDays.includes(getDay(date));
    }, [formData.specificDate, workingDays]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;
        if (mode === "specific" && !isDayValid) return;

        setIsPending(true);
        try {
            const dataToSubmit = {
                ...formData,
                specificDate: mode === "specific" && formData.specificDate ? new Date(formData.specificDate + "T00:00:00") : undefined,
                specificTime: mode === "specific" ? formData.specificTime : undefined,
                preferredDays: mode === "general" ? formData.preferredDays : undefined,
                preferredHours: mode === "general" ? formData.preferredHours : undefined,
            };

            await addToWaitingList(dataToSubmit);
            setIsSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setIsSuccess(false);
            }, 3000);
            setFormData({ name: "", phone: "", email: "", preferredDays: "", preferredHours: "", specificDate: "", specificTime: "" });
        } catch (error) {
            console.error("Error joining waiting list:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-stone-200 bg-white shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all group gap-3">
                    <CalendarHeart size={18} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 leading-none mb-1">Não encontrou horário?</p>
                        <p className="text-[11px] font-bold text-stone-800 leading-none uppercase tracking-widest">Entrar na Lista de Espera</p>
                    </div>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2.5rem] border-stone-100">
                <form onSubmit={handleSubmit} className="p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-3xl font-light text-stone-900 tracking-tight">
                            Lista de <span className="italic font-serif">Espera</span>
                        </DialogTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-2">
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
                                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest mt-1">Nós te avisaremos pelo WhatsApp.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {/* Informações Pessoais */}
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-1">Seus Dados</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Seu nome completo"
                                            className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200 h-12"
                                        />
                                        <Input
                                            required
                                            value={formData.phone}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="WhatsApp (00) 00000-0000"
                                            className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200 h-12"
                                        />
                                    </div>
                                </div>

                                {/* Seletor de Modo */}
                                <div className="p-1 bg-stone-100 rounded-xl flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setMode("general")}
                                        className={cn(
                                            "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                            mode === "general" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                                        )}
                                    >
                                        Desejo qualquer vaga
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode("specific")}
                                        className={cn(
                                            "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                            mode === "specific" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                                        )}
                                    >
                                        Desejo horário específico
                                    </button>
                                </div>

                                {/* Campos Condicionais */}
                                <div className="min-h-[140px] animate-in fade-in slide-in-from-top-2 duration-300">
                                    {mode === "general" ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-1 flex items-center gap-1">
                                                    <CalendarIcon size={10} /> Dias Preferidos
                                                </label>
                                                <Input
                                                    value={formData.preferredDays}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredDays: e.target.value })}
                                                    placeholder="Ex: Seg e Ter"
                                                    className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200 h-12"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-1 flex items-center gap-1">
                                                    <Clock size={10} /> Período
                                                </label>
                                                <Input
                                                    value={formData.preferredHours}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredHours: e.target.value })}
                                                    placeholder="Ex: Manhã"
                                                    className="rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200 h-12"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-1 flex items-center gap-1">
                                                    <CalendarIcon size={10} /> Dia Desejado
                                                </label>
                                                <Input
                                                    type="date"
                                                    required={mode === "specific"}
                                                    value={formData.specificDate}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, specificDate: e.target.value, specificTime: "" })}
                                                    className={cn(
                                                        "rounded-xl bg-stone-50 border-stone-100 focus:ring-stone-200 h-12",
                                                        !isDayValid && "border-red-200 bg-red-50"
                                                    )}
                                                />
                                                {!isDayValid && (
                                                    <p className="text-[8px] text-red-500 font-bold uppercase tracking-tight px-1">A Dra. não atende neste dia</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 px-1 flex items-center gap-1">
                                                    <Clock size={10} /> Hora Exata
                                                </label>
                                                <select
                                                    required={mode === "specific"}
                                                    disabled={!formData.specificDate || !isDayValid}
                                                    value={formData.specificTime}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, specificTime: e.target.value })}
                                                    className="rounded-xl bg-stone-50 border border-stone-100 focus:ring-2 focus:ring-stone-200 h-12 px-3 text-sm outline-none disabled:opacity-50"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {availableSlotsForDate.map(slot => (
                                                        <option key={slot} value={slot}>{slot}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="mt-8">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-stone-900 text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-stone-200 hover:scale-[1.02] active:scale-95 transition-all"
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
