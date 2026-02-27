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
            if (activeTab === 'realizadas') matchesStatus = app.status === 'CONFIRMED' || app.status === 'COMPLETED';
            else if (activeTab === 'pendentes') matchesStatus = app.status === 'PENDING';
            else if (activeTab === 'canceladas') matchesStatus = app.status === 'CANCELLED';
            else if (activeTab === 'ausentes') matchesStatus = app.status === 'ABSENT';

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [appointments, search, dateFilter, mounted, activeTab]);

    const stats = useMemo(() => {
        return {
            realizadas: appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length,
            pendentes: appointments.filter(a => a.status === 'PENDING').length,
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

            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr>
                            <th className="py-3 px-4 font-black uppercase text-[10px] text-stone-400 tracking-widest w-12 text-center">#</th>
                            <th className="py-3 px-4 font-black uppercase text-[10px] text-stone-400 tracking-widest w-40">Data/Hora</th>
                            <th className="py-3 px-4 font-black uppercase text-[10px] text-stone-400 tracking-widest">Evolução</th>
                            <th className="py-3 px-4 font-black uppercase text-[10px] text-stone-400 tracking-widest w-24 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {filteredAppointments.length > 0 ? filteredAppointments.map((app, i) => (
                            <EvolutionItem
                                key={app.id}
                                app={app}
                                appointments={appointments}
                                patientId={patientId}
                            />
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-12 text-center bg-stone-50/30">
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
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EvolutionItem({ app, appointments, patientId }: { app: any, appointments: any[], patientId: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <tr className="hover:bg-stone-50/50 transition-colors group">
            <td className="py-3 px-4 text-center align-top">
                <div className="w-6 h-6 mx-auto rounded bg-stone-100 flex items-center justify-center text-stone-500 font-black text-[10px]">
                    {appointments.length - appointments.indexOf(app)}
                </div>
            </td>
            <td className="py-3 px-4 align-top">
                <p className="text-xs font-bold text-stone-800" suppressHydrationWarning>
                    {app.evolution?.date
                        ? format(new Date(app.evolution.date), "dd/MM/yyyy")
                        : format(new Date(app.startTime), "dd/MM/yyyy")}
                </p>
                <div className="flex flex-col items-start gap-1 mt-1" suppressHydrationWarning>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        {format(new Date(app.startTime), "HH:mm")} • {app.type.charAt(0)}
                    </p>
                    {app.evolution?.date && format(new Date(app.evolution.date), "yyyy-MM-dd") !== format(new Date(app.startTime), "yyyy-MM-dd") && (
                        <span className="text-[8px] text-amber-600 font-black uppercase tracking-widest">Data editada</span>
                    )}
                    <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border inline-block mt-0.5",
                        (app.status === 'CONFIRMED' || app.status === 'COMPLETED') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            app.status === 'ABSENT' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                app.status === 'CANCELLED' ? "bg-red-50 text-red-600 border-red-100" :
                                    "bg-stone-50 text-stone-400 border-stone-100"
                    )}>
                        {(app.status === 'CONFIRMED' || app.status === 'COMPLETED') ? 'Realizada' :
                            app.status === 'ABSENT' ? 'Ausente' :
                                app.status === 'CANCELLED' ? 'Cancelada' :
                                    'Pendente'}
                    </span>
                </div>
            </td>
            <td className={cn(
                "py-3 px-4 align-top",
                app.evolution ? "cursor-pointer" : ""
            )}
                onClick={() => { if (app.evolution) setExpanded(!expanded) }}>
                {app.evolution ? (
                    <p className={cn(
                        "text-xs text-stone-600 leading-relaxed whitespace-pre-wrap transition-all",
                        !expanded && "line-clamp-2"
                    )}>
                        {app.evolution.content}
                    </p>
                ) : (
                    <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest italic pt-0.5">
                        Sem nota
                    </p>
                )}
            </td>
            <td className="py-3 px-4 align-top text-right">
                <EvolutionDialog
                    patientId={patientId}
                    appointmentId={app.id}
                    initialContent={app.evolution?.content}
                    trigger={
                        <button className="text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors bg-white border border-stone-200 px-3 py-1.5 rounded shadow-sm hover:border-stone-400 whitespace-nowrap">
                            {app.evolution ? "Editar" : "+ Nota"}
                        </button>
                    }
                />
            </td>
        </tr>
    );
}
