"use client";

import { useState, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    getDay,
    isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Video, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";

interface Appointment {
    id: string;
    startTime: Date;
    endTime: Date;
    status: AppointmentStatus;
    type: "ONLINE" | "PRESENCIAL";
    patient: {
        id: string;
        name: string;
    };
}

interface MonthlyCalendarProps {
    initialAppointments: Appointment[];
    initialDate?: string;
}

export function MonthlyCalendarClient({ initialAppointments, initialDate }: MonthlyCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => initialDate ? new Date(initialDate) : new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad days to align with day of week (0 = Sunday)
    const firstDayOfMonth = getDay(monthStart);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const appointmentsByDay = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        initialAppointments.forEach((app) => {
            const dateKey = format(new Date(app.startTime), "yyyy-MM-dd");
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(app);
        });
        return map;
    }, [initialAppointments]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case "COMPLETED": return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15";
            case "ABSENT": return "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/15";
            case "CANCELLED": return "bg-white/5 text-muted-fg border-border/40 hover:bg-white/10";
            case "CONFIRMED": return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15";
            default: return "bg-surface/60 text-muted-fg border-border/60 hover:bg-surface/80";
        }
    };

    return (
        <div className="bg-surface/30 rounded-[2.5rem] border border-border/60 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 backdrop-blur-md relative z-10">
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-border/40 bg-surface/20">
                <div className="space-y-1">
                    <h3 className="text-3xl font-light text-foreground tracking-tight">
                        Calendário <span className="italic font-serif text-muted-fg">Mensal</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        Visualização de Fluxo e Agendamentos
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface/50 rounded-2xl border border-border/80 p-1 shadow-sm backdrop-blur-md">
                        <button onClick={handlePrevMonth} className="p-3 hover:bg-surface rounded-xl transition-all text-muted-fg hover:text-foreground">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-6 text-xs font-bold uppercase tracking-[0.2em] text-foreground min-w-[180px] text-center">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </div>
                        <button onClick={handleNextMonth} className="p-3 hover:bg-surface rounded-xl transition-all text-muted-fg hover:text-foreground">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-b border-border/40 bg-surface/10">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="py-4 text-center text-[9px] font-black uppercase tracking-widest text-muted-fg/80 border-r border-border/40 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-surface/5">
                {blanks.map((i) => (
                    <div key={`blank-${i}`} className="min-h-[160px] bg-black/10 border-r border-b border-border/40 last:border-r-0" />
                ))}
                {days.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const apps = appointmentsByDay[dateKey] || [];
                    const isTodayDate = isToday(day);

                    return (
                        <div 
                            key={dateKey} 
                            className={cn(
                                "min-h-[160px] p-4 border-r border-b border-border/40 last:border-r-0 hover:bg-surface/20 transition-all group",
                                isTodayDate && "bg-primary/5 border-primary/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                    "text-xs font-bold flex items-center justify-center w-7 h-7 rounded-lg transition-all",
                                    isTodayDate ? "bg-primary text-foreground shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)]" : "text-muted-fg group-hover:text-foreground"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {apps.length > 0 && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-primary">
                                        {apps.length} {apps.length === 1 ? 'Sessão' : 'Sessões'}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                {apps.slice(0, 4).map((app) => (
                                    <Link 
                                        key={app.id} 
                                        href={`/area-clinica/prontuarios/${app.patient.id}`}
                                        className={cn(
                                            "block p-1.5 rounded-lg border text-[8px] font-bold truncate hover:scale-[1.02] transition-transform",
                                            getStatusColor(app.status)
                                        )}
                                    >
                                        {format(new Date(app.startTime), "HH:mm")} • {app.patient.name}
                                    </Link>
                                ))}
                                {apps.length > 4 && (
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-muted-fg text-center pt-1 animate-pulse">
                                        + {apps.length - 4} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
