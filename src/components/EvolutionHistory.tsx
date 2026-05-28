"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { EvolutionDialog } from "./EvolutionDialog";

interface EvolutionHistoryProps {
    appointments: any[];
    patientId: string;
}

export function EvolutionHistory({ appointments, patientId }: EvolutionHistoryProps) {
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'realizadas' | 'pendentes' | 'canceladas' | 'ausentes'>('all');

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredAppointments = useMemo(() => {
        if (!mounted) return [];
        return appointments.filter(app => {
            const matchesSearch = !search || app.evolution?.content?.toLowerCase().includes(search.toLowerCase());

            let matchesDate = true;
            if (dateFilter) {
                const appDate = format(new Date(app.startTime), "yyyy-MM-dd");
                matchesDate = appDate === dateFilter;
            }

            let matchesStatus = true;
            if (activeTab === 'realizadas') matchesStatus = app.status === 'COMPLETED';
            else if (activeTab === 'pendentes') matchesStatus = app.status === 'PENDING' || app.status === 'CONFIRMED';
            else if (activeTab === 'canceladas') matchesStatus = app.status === 'CANCELLED';
            else if (activeTab === 'ausentes') matchesStatus = app.status === 'ABSENT';

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [appointments, search, dateFilter, mounted, activeTab]);

    const stats = useMemo(() => {
        return {
            realizadas: appointments.filter(a => a.status === 'COMPLETED').length,
            pendentes: appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
            canceladas: appointments.filter(a => a.status === 'CANCELLED').length,
            ausentes: appointments.filter(a => a.status === 'ABSENT').length,
        };
    }, [appointments]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Histórico de Atendimento</h3>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 w-3 h-3" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar notas..."
                            className="w-full h-9 pl-9 pr-4 text-[10px] bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-100 font-bold uppercase tracking-widest placeholder:text-stone-300"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs de Status */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit">
                {[
                    { id: 'all', label: 'Todos', count: appointments.length },
                    { id: 'realizadas', label: 'Realizadas', count: stats.realizadas },
                    { id: 'pendentes', label: 'Pendentes', count: stats.pendentes },
                    { id: 'canceladas', label: 'Canceladas', count: stats.canceladas },
                    { id: 'ausentes', label: 'Ausentes', count: stats.ausentes },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                            activeTab === tab.id
                                ? "bg-white text-stone-900 shadow-sm"
                                : "text-stone-400 hover:text-stone-600"
                        )}
                    >
                        {tab.label}
                        <span className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center text-[8px]",
                            activeTab === tab.id ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
                {filteredAppointments.length > 0 ? filteredAppointments.map((app, i) => (
                    <TimelineItem
                        key={app.id}
                        app={app}
                        appointments={appointments}
                        patientId={patientId}
                    />
                )) : (
                    <div className="py-20 text-center bg-stone-50/30 rounded-3xl border border-dashed border-stone-200">
                        <p className="text-stone-400 font-medium text-sm">Nenhum registro encontrado.</p>
                        {(search || dateFilter || activeTab !== 'all') && (
                            <Button
                                variant="link"
                                onClick={() => { setSearch(""); setDateFilter(""); setActiveTab('all'); }}
                                className="text-[10px] font-black uppercase tracking-widest text-stone-900 mt-2"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function TimelineItem({ app, appointments, patientId }: { app: any, appointments: any[], patientId: string }) {
    const [expanded, setExpanded] = useState(false);
    const isCompleted = app.status === 'COMPLETED';
    
    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Icon/Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-50 text-stone-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-stone-900 group-hover:text-white transition-all duration-500 z-10">
                <span className="text-[10px] font-black">{appointments.length - appointments.indexOf(app)}</span>
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                    <time className="text-[10px] font-black uppercase tracking-widest text-stone-400" suppressHydrationWarning>
                        {app.evolution?.date
                            ? format(new Date(app.evolution.date), "dd 'de' MMMM, yyyy", { locale: ptBR })
                            : format(new Date(app.startTime), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </time>
                    <div className="flex items-center gap-2">
                        {app.evolution?.isDraft && (
                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded">Rascunho</span>
                        )}
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                            isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                app.status === 'ABSENT' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    app.status === 'CANCELLED' ? "bg-red-50 text-red-600 border-red-100" :
                                        "bg-stone-50 text-stone-400 border-stone-100"
                        )}>
                            {isCompleted ? 'Realizada' :
                                app.status === 'ABSENT' ? 'Ausente' :
                                    app.status === 'CANCELLED' ? 'Cancelada' :
                                        'Pendente'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div 
                        className={cn(
                            "relative transition-all duration-500",
                            !expanded && app.evolution?.content?.length > 200 && "cursor-pointer"
                        )}
                        onClick={() => { if (app.evolution?.content?.length > 200) setExpanded(!expanded) }}
                    >
                        {app.evolution ? (
                            <p className={cn(
                                "text-sm text-stone-600 leading-relaxed whitespace-pre-wrap",
                                !expanded && "line-clamp-3"
                            )}>
                                {app.evolution.content}
                            </p>
                        ) : (
                            <p className="text-xs text-stone-300 italic">Nenhuma observação registrada para esta sessão.</p>
                        )}
                        
                        {!expanded && app.evolution?.content?.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                        <div className="flex items-center gap-3 text-stone-400">
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                {format(new Date(app.startTime), "HH:mm")} • {app.type}
                            </span>
                        </div>
                        <EvolutionDialog
                            patientId={patientId}
                            appointmentId={app.id}
                            initialContent={app.evolution?.content}
                            trigger={
                                <button className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1">
                                    {app.evolution ? "Editar Evolução" : "+ Adicionar Nota"}
                                </button>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
