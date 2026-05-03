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
}

export function MonthlyCalendarClient({ initialAppointments }: MonthlyCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
            case "COMPLETED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "ABSENT": return "bg-red-100 text-red-700 border-red-200";
            case "CANCELLED": return "bg-amber-100 text-amber-700 border-amber-200";
            case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-stone-100 text-stone-600 border-stone-200";
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-stone-50 bg-stone-50/30">
                <div className="space-y-1">
                    <h3 className="text-3xl font-light text-stone-900 tracking-tight">
                        Calendário <span className="italic font-serif text-stone-500">Mensal</span>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                        Visualização de Fluxo e Agendamentos
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white rounded-2xl border border-stone-100 p-1 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-3 hover:bg-stone-50 rounded-xl transition-all text-stone-400 hover:text-stone-900">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 text-xs font-black uppercase tracking-[0.2em] text-stone-800 min-w-[180px] text-center">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </div>
                        <button onClick={handleNextMonth} className="p-3 hover:bg-stone-50 rounded-xl transition-all text-stone-400 hover:text-stone-900">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 border-b border-stone-50">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="py-4 text-center text-[9px] font-black uppercase tracking-widest text-stone-300 border-r border-stone-50 last:border-r-0 bg-stone-50/10">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {blanks.map((i) => (
                    <div key={`blank-${i}`} className="min-h-[160px] bg-stone-50/5 border-r border-b border-stone-50 last:border-r-0" />
                ))}
                {days.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const apps = appointmentsByDay[dateKey] || [];
                    const isTodayDate = isToday(day);

                    return (
                        <div 
                            key={dateKey} 
                            className={cn(
                                "min-h-[160px] p-4 border-r border-b border-stone-50 last:border-r-0 hover:bg-stone-50/30 transition-all group",
                                isTodayDate && "bg-stone-50/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={cn(
                                    "text-sm font-bold flex items-center justify-center w-7 h-7 rounded-lg transition-all",
                                    isTodayDate ? "bg-stone-900 text-white shadow-lg" : "text-stone-400 group-hover:text-stone-900"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {apps.length > 0 && (
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-stone-300">
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
                                    <div className="text-[7px] font-black uppercase tracking-widest text-stone-300 text-center pt-1">
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
