"use client";

import { useState, useMemo } from "react";
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

    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => {
            const matchesSearch = app.evolution?.content?.toLowerCase().includes(search.toLowerCase()) ||
                format(app.startTime, "MMMM", { locale: ptBR }).toLowerCase().includes(search.toLowerCase());

            let matchesDate = true;
            if (dateFilter) {
                const appDate = format(app.startTime, "yyyy-MM-dd");
                matchesDate = appDate === dateFilter;
            }

            return matchesSearch && matchesDate;
        });
    }, [appointments, search, dateFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Linha do Tempo / Evoluções</h3>

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
                    <div className="relative">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="h-9 px-3 text-[10px] bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-100 font-bold uppercase tracking-widest text-stone-600"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredAppointments.length > 0 ? filteredAppointments.map((app, i) => (
                    <div key={app.id} className="bg-white border border-stone-200 rounded-2xl p-6 transition-all hover:border-stone-300 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-stone-100 group-hover:bg-stone-900 transition-colors" />
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 font-black text-xs">
                                    {appointments.length - appointments.indexOf(app)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-800 tracking-tight">
                                        Sessão de {format(app.startTime, "eeee, dd 'de' MMMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                        {format(app.startTime, "HH:mm")} às {format(app.endTime, "HH:mm")} • Modalidade {app.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <EvolutionDialog
                                    patientId={patientId}
                                    appointmentId={app.id}
                                    initialContent={app.evolution?.content}
                                    trigger={
                                        <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                                            {app.evolution ? "Editar" : "+ Nota"}
                                        </button>
                                    }
                                />
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                    app.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-stone-50 text-stone-400 border-stone-100"
                                )}>
                                    {app.status}
                                </span>
                            </div>
                        </div>
                        <div className={cn(
                            "rounded-xl p-4 mt-4 border transition-colors",
                            app.evolution ? "bg-stone-50/30 border-stone-100/50" : "bg-stone-50/50 border-dashed border-stone-200"
                        )}>
                            {app.evolution ? (
                                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                                    {app.evolution.content}
                                </p>
                            ) : (
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">
                                    Nenhuma nota registrada para esta sessão.
                                </p>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center bg-white border border-stone-100 rounded-3xl border-dashed">
                        <p className="text-stone-300 italic font-medium">Nenhum registro encontrado para os filtros aplicados.</p>
                        {(search || dateFilter) && (
                            <Button
                                variant="link"
                                onClick={() => { setSearch(""); setDateFilter(""); }}
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
