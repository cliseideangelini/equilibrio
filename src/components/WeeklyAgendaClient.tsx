"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, addDays, subWeeks, addWeeks, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ChevronLeft,
    ChevronRight,
    Pin,
    PinOff,
    Plus,
    Video,
    MapPin,
    Search,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createManualAppointment, updatePatientFixedSchedule } from "@/lib/actions";

interface Appointment {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    status: string;
    type: string;
    patient: {
        id: string;
        name: string;
        phone?: string;
    };
}

interface AvailabilityRange {
    dayOfWeek: number;
    startTime: number; // minutos desde a meia-noite
    endTime: number;
}

interface Patient {
    id: string;
    name: string;
    phone: string;
}

interface WeeklyAgendaClientProps {
    initialAppointments: Appointment[];
    initialDate: string;
    availabilities: AvailabilityRange[];
    patients: Patient[];
}

const DAY_LABELS: Record<number, string> = {
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
};

function minutesToLabel(min: number) {
    const h = Math.floor(min / 60).toString().padStart(2, "0");
    const m = (min % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function WeeklyAgendaClient({ initialAppointments, initialDate, availabilities, patients }: WeeklyAgendaClientProps) {
    const router = useRouter();
    const weekStart = useMemo(() => startOfWeek(new Date(initialDate), { weekStartsOn: 1 }), [initialDate]);
    const [pendingPin, setPendingPin] = useState<string | null>(null);
    const [quickBookCell, setQuickBookCell] = useState<{ date: Date; time: string } | null>(null);

    // Só exibimos dias com regras cadastradas (por padrão, segunda a sexta)
    const activeDayNumbers = useMemo(() => {
        const set = new Set(availabilities.map(a => a.dayOfWeek));
        return (set.size > 0 ? Array.from(set) : [1, 2, 3, 4, 5]).sort((a, b) => a - b);
    }, [availabilities]);

    const days = useMemo(
        () => activeDayNumbers.map(dow => addDays(weekStart, dow - 1)),
        [weekStart, activeDayNumbers]
    );

    // Grade de horários = união de todas as faixas de disponibilidade, em passos de 30min
    const timeSlots = useMemo(() => {
        if (availabilities.length === 0) {
            const slots: string[] = [];
            for (let m = 7 * 60; m < 18 * 60; m += 30) slots.push(minutesToLabel(m));
            return slots;
        }
        const min = Math.min(...availabilities.map(a => a.startTime));
        const max = Math.max(...availabilities.map(a => a.endTime));
        const slots: string[] = [];
        for (let m = min; m < max; m += 30) slots.push(minutesToLabel(m));
        return slots;
    }, [availabilities]);

    const availabilityByDay = useMemo(() => {
        const map = new Map<number, { start: number; end: number }[]>();
        availabilities.forEach(a => {
            const arr = map.get(a.dayOfWeek) || [];
            arr.push({ start: a.startTime, end: a.endTime });
            map.set(a.dayOfWeek, arr);
        });
        return map;
    }, [availabilities]);

    const appointmentsByKey = useMemo(() => {
        const map = new Map<string, Appointment>();
        initialAppointments.forEach(app => {
            const key = format(new Date(app.startTime), "yyyy-MM-dd_HH:mm");
            map.set(key, app);
        });
        return map;
    }, [initialAppointments]);

    const isSlotAvailable = (dayOfWeek: number, slotLabel: string) => {
        const ranges = availabilityByDay.get(dayOfWeek);
        if (!ranges) return false;
        const [h, m] = slotLabel.split(":").map(Number);
        const minutes = h * 60 + m;
        return ranges.some(r => minutes >= r.start && minutes < r.end);
    };

    const handleNavigate = (weeks: number) => {
        const newWeek = weeks > 0 ? addWeeks(weekStart, weeks) : subWeeks(weekStart, -weeks);
        router.push(`/area-clinica/agenda?view=week&date=${format(newWeek, "yyyy-MM-dd")}`);
    };

    const handlePin = async (patientId: string, dayOfWeek: number, time: string) => {
        setPendingPin(patientId);
        try {
            await updatePatientFixedSchedule(patientId, true, dayOfWeek, time);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Erro ao fixar horário do paciente.");
        } finally {
            setPendingPin(null);
        }
    };

    const handleUnpin = async (patientId: string) => {
        setPendingPin(patientId);
        try {
            await updatePatientFixedSchedule(patientId, false, null, null);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Erro ao desfixar horário do paciente.");
        } finally {
            setPendingPin(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Navegação de semana */}
            <div className="flex items-center justify-between bg-surface/40 border border-border/80 rounded-[2rem] p-2 backdrop-blur-md">
                <button onClick={() => handleNavigate(-1)} className="p-3 hover:bg-surface rounded-xl transition-all text-muted-fg hover:text-foreground">
                    <ChevronLeft size={16} />
                </button>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    {format(weekStart, "dd/MM", { locale: ptBR })} — {format(addDays(weekStart, activeDayNumbers[activeDayNumbers.length - 1] - 1), "dd/MM/yyyy", { locale: ptBR })}
                </div>
                <button onClick={() => handleNavigate(1)} className="p-3 hover:bg-surface rounded-xl transition-all text-muted-fg hover:text-foreground">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Grade semanal */}
            <div className="bg-surface/20 border border-border/80 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[820px]">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border/80">
                                <th className="py-4 px-4 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg w-[90px]">Horário</th>
                                {days.map((day, idx) => (
                                    <th key={day.toISOString()} className="py-4 px-3 text-center font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg border-l border-border/40">
                                        {DAY_LABELS[activeDayNumbers[idx]] || format(day, "EEEE", { locale: ptBR })}
                                        <div className="text-foreground text-xs font-bold normal-case tracking-normal mt-0.5">{format(day, "dd/MM")}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {timeSlots.map(slot => (
                                <tr key={slot}>
                                    <td className="py-2 px-4 text-[11px] font-mono font-bold text-muted-fg whitespace-nowrap">{slot}</td>
                                    {days.map((day, idx) => {
                                        const dayOfWeek = activeDayNumbers[idx];
                                        const dateKey = format(day, "yyyy-MM-dd");
                                        const appt = appointmentsByKey.get(`${dateKey}_${slot}`);
                                        const available = isSlotAvailable(dayOfWeek, slot);
                                        const isVirtualFixed = appt?.id.startsWith("fixed-");

                                        return (
                                            <td key={dateKey + slot} className="p-1.5 align-top border-l border-border/20">
                                                {appt ? (
                                                    <div className={cn(
                                                        "group relative rounded-xl p-2 border text-[10px] font-bold leading-tight",
                                                        appt.status === "CANCELLED" ? "bg-surface/40 border-border/40 text-muted-fg" :
                                                            appt.status === "ABSENT" ? "bg-rose-400/10 border-rose-400/20 text-rose-400" :
                                                                appt.status === "COMPLETED" ? "bg-primary/10 border-primary/20 text-primary" :
                                                                    "bg-blue-400/10 border-blue-400/20 text-blue-400"
                                                    )}>
                                                        <Link href={`/area-clinica/prontuarios/${appt.patient.id}`} className="block hover:opacity-75 transition-opacity pr-4">
                                                            {appt.patient.name}
                                                            <span className="flex items-center gap-1 mt-0.5 font-normal opacity-80">
                                                                {appt.type === "ONLINE" ? <Video size={9} /> : <MapPin size={9} />}
                                                            </span>
                                                        </Link>
                                                        {/* Ícone fixar/desafixar — visível só na área clínica */}
                                                        <button
                                                            title={isVirtualFixed ? "Remover horário fixo" : "Fixar este horário toda semana"}
                                                            disabled={pendingPin === appt.patient.id}
                                                            onClick={() => isVirtualFixed ? handleUnpin(appt.patient.id) : handlePin(appt.patient.id, dayOfWeek, slot)}
                                                            className={cn(
                                                                "absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                                                isVirtualFixed
                                                                    ? "text-primary opacity-100"
                                                                    : "opacity-0 group-hover:opacity-100 text-muted-fg hover:text-primary"
                                                            )}
                                                        >
                                                            {pendingPin === appt.patient.id ? (
                                                                <Loader2 size={11} className="animate-spin" />
                                                            ) : isVirtualFixed ? (
                                                                <Pin size={11} />
                                                            ) : (
                                                                <PinOff size={11} />
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : available ? (
                                                    <button
                                                        onClick={() => setQuickBookCell({ date: day, time: slot })}
                                                        className="w-full h-full min-h-[46px] rounded-xl border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center text-muted-fg hover:text-primary transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                ) : (
                                                    <div className="min-h-[46px] rounded-xl bg-black/5" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {quickBookCell && (
                <QuickBookDialog
                    date={quickBookCell.date}
                    time={quickBookCell.time}
                    patients={patients}
                    onClose={() => setQuickBookCell(null)}
                />
            )}
        </div>
    );
}

interface QuickBookDialogProps {
    date: Date;
    time: string;
    patients: Patient[];
    onClose: () => void;
}

function QuickBookDialog({ date, time, patients, onClose }: QuickBookDialogProps) {
    const [search, setSearch] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [type, setType] = useState<"ONLINE" | "PRESENCIAL">("ONLINE");
    const [isPending, setIsPending] = useState(false);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
    ).slice(0, 6);

    const handleBook = async () => {
        if (!selectedPatientId) return alert("Selecione um paciente");
        setIsPending(true);
        try {
            const dateKey = format(date, "yyyy-MM-dd");
            const appointmentDate = new Date(`${dateKey}T${time}:00`);
            await createManualAppointment({ patientId: selectedPatientId, date: appointmentDate, type });
            window.location.reload();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao agendar consulta.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-8 border-stone-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-stone-900 tracking-tight">
                        Agendar <span className="italic font-serif text-stone-500">{format(date, "dd/MM")} às {time}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-4">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Selecionar Paciente</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Nome ou telefone..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); if (selectedPatientId) setSelectedPatientId(null); }}
                                className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium text-stone-900 outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                                autoFocus
                            />
                        </div>
                        {search && !selectedPatientId && (
                            <div className="bg-white border border-stone-100 rounded-2xl shadow-lg mt-2 overflow-hidden max-h-48 overflow-y-auto">
                                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setSelectedPatientId(p.id); setSearch(p.name); }}
                                        className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 flex flex-col"
                                    >
                                        <span className="text-sm font-bold text-stone-800">{p.name}</span>
                                        <span className="text-[10px] text-stone-400 font-mono">{p.phone}</span>
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-sm text-stone-400 italic">Nenhum paciente encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Modalidade</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setType("ONLINE")}
                                className={cn(
                                    "h-11 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                    type === "ONLINE" ? "bg-stone-900 border-stone-900 text-white" : "bg-white border-stone-100 text-stone-400 hover:border-stone-300"
                                )}
                            >
                                <Video size={14} /> Online
                            </button>
                            <button
                                onClick={() => setType("PRESENCIAL")}
                                className={cn(
                                    "h-11 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                    type === "PRESENCIAL" ? "bg-stone-900 border-stone-900 text-white" : "bg-white border-stone-100 text-stone-400 hover:border-stone-300"
                                )}
                            >
                                <MapPin size={14} /> Presencial
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleBook}
                        disabled={isPending || !selectedPatientId}
                        className="w-full h-14 rounded-2xl bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-all mt-2"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
