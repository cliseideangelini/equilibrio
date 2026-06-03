"use client";

import { useState, useMemo, useEffect } from "react";
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
import { addToWaitingList, getAvailableSlots } from "@/lib/actions";
import { Loader2, CalendarHeart, CheckCircle2, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDay } from "date-fns";

interface AvailabilityRule {
    dayOfWeek: number;
    startTime: number;
    endTime: number;
}

interface WaitingListDialogProps {
    rules: AvailabilityRule[];
    patientName?: string;
    patientPhone?: string;
}

export function WaitingListDialog({ rules, patientName, patientPhone }: WaitingListDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mode, setMode] = useState<"general" | "specific">("general");

    const [formData, setFormData] = useState({
        name: patientName || "",
        phone: patientPhone || "",
        email: "",
        preferredDays: "",
        specificDate: "",
        specificTime: "",
        preferredShift: "MANHA" as "MANHA" | "TARDE"
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

    const [realAvailableSlots, setRealAvailableSlots] = useState<string[]>([]);
    const [isCheckingSlots, setIsCheckingSlots] = useState(false);

    useEffect(() => {
        if (mode === "specific" && formData.specificDate && isDayValid) {
            setIsCheckingSlots(true);
            const isoDate = new Date(formData.specificDate + "T00:00:00").toISOString();
            getAvailableSlots(isoDate)
                .then(slots => setRealAvailableSlots(slots))
                .catch(() => setRealAvailableSlots([]))
                .finally(() => setIsCheckingSlots(false));
        } else {
            setRealAvailableSlots([]);
        }
    }, [formData.specificDate, mode, isDayValid]);

    const hasAvailableSlots = realAvailableSlots.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;
        if (mode === "specific" && (!isDayValid || hasAvailableSlots)) return;

        setIsPending(true);
        try {
            const dataToSubmit = {
                ...formData,
                specificDate: mode === "specific" && formData.specificDate ? new Date(formData.specificDate + "T00:00:00") : undefined,
                specificTime: mode === "specific" ? formData.specificTime : undefined,
                preferredDays: mode === "general" ? formData.preferredDays : undefined,
                preferredShift: mode === "general" ? formData.preferredShift : undefined,
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
                <Button variant="ghost" className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all group gap-2">
                    <CalendarHeart size={14} className="text-primary group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Entrar na Lista de Espera</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] text-white">
                <form onSubmit={handleSubmit} className="p-8 relative">
                    {/* Efeito de Fundo */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem] z-0">
                        <div className="absolute -top-[20%] -right-[20%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-light text-white tracking-tight">
                                Lista de <span className="italic font-serif text-primary">Espera</span>
                            </DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">
                                Avisaremos você via WhatsApp assim que surgir uma vaga.
                            </p>
                        </DialogHeader>

                        {isSuccess ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-white font-bold text-lg">Inscrito com sucesso!</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Nós te avisaremos pelo WhatsApp.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {/* Informações Pessoais */}
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1">Seus Dados</label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Seu nome completo"
                                                className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 h-12"
                                            />
                                            <Input
                                                required
                                                value={formData.phone}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="WhatsApp (00) 00000-0000"
                                                className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 h-12"
                                            />
                                        </div>
                                    </div>

                                    {/* Seletor de Modo */}
                                    <div className="p-1 bg-white/5 border border-white/10 rounded-xl flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setMode("general")}
                                            className={cn(
                                                "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                mode === "general" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            Desejo qualquer vaga
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode("specific")}
                                            className={cn(
                                                "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                mode === "specific" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            Horário específico
                                        </button>
                                    </div>

                                    {/* Campos Condicionais */}
                                    <div className="min-h-[140px] animate-in fade-in slide-in-from-top-2 duration-300">
                                        {mode === "general" ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1">
                                                        <CalendarIcon size={10} /> Dias Preferidos
                                                    </label>
                                                    <Input
                                                        value={formData.preferredDays}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredDays: e.target.value })}
                                                        placeholder="Ex: Seg e Ter"
                                                        className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 h-12"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1">
                                                        <Clock size={10} /> Turno de Preferência
                                                    </label>
                                                    <select
                                                        value={formData.preferredShift}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, preferredShift: e.target.value as any })}
                                                        className="rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-primary/20 h-12 px-3 text-sm text-white outline-none appearance-none"
                                                    >
                                                        <option value="MANHA" className="bg-[#1A1C23] text-white">Manhã (07:00 - 11:30)</option>
                                                        <option value="TARDE" className="bg-[#1A1C23] text-white">Tarde (14:30 - 17:30)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1">
                                                        <CalendarIcon size={10} /> Dia Desejado
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        required={mode === "specific"}
                                                        value={formData.specificDate}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, specificDate: e.target.value, specificTime: "" })}
                                                        className={cn(
                                                            "rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 h-12 [color-scheme:dark]",
                                                            !isDayValid && "border-red-500/50 bg-red-500/10 text-red-200"
                                                        )}
                                                    />
                                                    {!isDayValid && (
                                                        <p className="text-[8px] text-red-400 font-bold uppercase tracking-tight px-1">A Dra. não atende neste dia</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-1">
                                                        <Clock size={10} /> Hora Exata
                                                    </label>
                                                    {isCheckingSlots ? (
                                                        <div className="flex items-center justify-center h-12 bg-white/5 border border-white/10 rounded-xl">
                                                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                                        </div>
                                                    ) : hasAvailableSlots ? (
                                                        <div className="flex flex-col justify-center h-12 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-tight">Vagas abertas!</p>
                                                            <p className="text-[8px] text-emerald-400/80 leading-tight mt-0.5">Agende pelo calendário.</p>
                                                        </div>
                                                    ) : (
                                                        <select
                                                            required={mode === "specific"}
                                                            disabled={!formData.specificDate || !isDayValid}
                                                            value={formData.specificTime}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, specificTime: e.target.value })}
                                                            className="rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-primary/20 h-12 px-3 text-sm text-white outline-none appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="" className="bg-[#1A1C23] text-white">Selecione...</option>
                                                            {availableSlotsForDate.map(slot => (
                                                                <option key={slot} value={slot} className="bg-[#1A1C23] text-white">{slot}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter className="mt-8">
                                    {mode === "specific" && hasAvailableSlots ? (
                                        <Button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all gap-2"
                                        >
                                            Ir para Agendamento <ArrowRight size={14} />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isPending || (mode === "specific" && !isDayValid)}
                                            className="w-full bg-white text-black hover:bg-stone-200 rounded-2xl h-14 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            {isPending ? <Loader2 size={16} className="animate-spin text-black" /> : "Confirmar na Lista de Espera"}
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
