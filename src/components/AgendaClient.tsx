"use client";

import { useState, useMemo } from "react";
import { format, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Video,
    MapPin,
    Search,
    ChevronRight,
    ExternalLink,
    Calendar as CalendarIcon,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancellationButton } from "@/components/CancellationButton";
import { AbsentButton } from "@/components/AbsentButton";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Appointment {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    type: string;
    meetLink: string | null;
    patient: {
        id: string;
        name: string;
        phone: string;
    };
    payment: {
        status: string;
    } | null;
}

interface AgendaClientProps {
    initialAppointments: Appointment[];
    initialDate: Date;
}

export function AgendaClient({ initialAppointments, initialDate }: AgendaClientProps) {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filtros avançados simples (ex: por modalidade)
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    const filteredAppointments = useMemo(() => {
        return initialAppointments.filter(app => {
            const matchesSearch =
                app.patient.name.toLowerCase().includes(search.toLowerCase()) ||
                app.patient.phone.includes(search);

            const matchesType = !typeFilter || app.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [initialAppointments, search, typeFilter]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        router.push(`/area-clinica/agenda?date=${newDate}`);
    };

    return (
        <div className="space-y-10">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 p-2 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-stone-300 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar por paciente ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium text-stone-600 placeholder:text-stone-300 w-full"
                    />
                </div>

                <div className="flex items-center gap-3 pr-2 w-full md:w-auto">
                    {/* Seletor de Data */}
                    <div className="relative group">
                        <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-stone-900 transition-colors pointer-events-none" />
                        <input
                            type="date"
                            defaultValue={format(initialDate, "yyyy-MM-dd")}
                            onChange={handleDateChange}
                            className="h-10 pl-11 pr-4 rounded-xl bg-stone-50 border-0 text-[10px] font-black uppercase tracking-widest text-stone-600 outline-none focus:ring-2 focus:ring-stone-100 cursor-pointer hover:bg-stone-100 transition-all"
                        />
                    </div>

                    {/* Filtros */}
                    <DropdownFilter
                        current={typeFilter}
                        onChange={setTypeFilter}
                        options={[
                            { label: "Todas Modalidades", value: null },
                            { label: "Online", value: "ONLINE" },
                            { label: "Presencial", value: "PRESENCIAL" }
                        ]}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-stone-50/30 border-b border-stone-100">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[140px]">Horário</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[140px]">Modalidade</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[120px]">Status</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[400px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredAppointments.length > 0 ? filteredAppointments.map((app, idx) => (
                                <tr key={app.id} className={cn(
                                    "hover:bg-stone-50/50 transition-all group",
                                    idx % 2 === 1 ? "bg-stone-50/10" : "bg-white"
                                )}>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-stone-900 shadow-sm" />
                                            <span className="text-sm font-black text-stone-900 font-mono italic">{format(new Date(app.startTime), 'HH:mm')}</span>
                                            <ChevronRight size={12} className="text-stone-200" />
                                            <span className="text-[10px] font-bold text-stone-400 font-mono">{format(new Date(app.endTime), 'HH:mm')}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-stone-100 flex items-center justify-center text-stone-400 transition-all shadow-sm border border-stone-200/50">
                                                <span className="font-black text-[10px] uppercase tracking-widest">{app.patient.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800 tracking-tight">{app.patient.name}</h4>
                                                <p className="text-[10px] text-stone-400 font-mono">{app.patient.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 text-stone-500 rounded-[1rem] border border-stone-100 shadow-sm">
                                            {app.type === 'ONLINE' ? (
                                                <Video size={10} className="text-blue-500" />
                                            ) : (
                                                <MapPin size={10} className="text-stone-500" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                                {app.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                            app.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                                app.status === 'COMPLETED' ? "bg-stone-50 text-stone-600 border-stone-100/50" :
                                                    app.status === 'CANCELLED' ? "bg-red-50 text-red-600 border-red-100/50" :
                                                        app.status === 'ABSENT' ? "bg-amber-50 text-amber-600 border-amber-100/50" :
                                                            "bg-amber-50 text-amber-600 border-amber-100/50"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full mr-2",
                                                app.status === 'CONFIRMED' ? "bg-emerald-500 shadow-emerald-500/20 shadow-lg" :
                                                    app.status === 'COMPLETED' ? "bg-stone-400" :
                                                        app.status === 'CANCELLED' ? "bg-red-500" :
                                                            "bg-amber-500"
                                            )} />
                                            {app.status === 'CONFIRMED' ? 'Confirmado' :
                                                app.status === 'COMPLETED' ? 'Realizado' :
                                                    app.status === 'CANCELLED' ? 'Cancelado' :
                                                        app.status === 'ABSENT' ? 'Ausente' : 'Aguardando'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-3 min-w-[350px]">
                                            {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                                                <>
                                                    {app.type === 'ONLINE' && app.meetLink && (
                                                        <Button asChild size="sm" className="h-9 px-5 rounded-[1.2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider shadow-lg shadow-blue-500/20 border-0 group/meet transition-all shrink-0">
                                                            <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">
                                                                Abrir Meet <ExternalLink size={12} className="ml-1.5 group-hover/meet:translate-x-0.5 transition-transform" />
                                                            </a>
                                                        </Button>
                                                    )}

                                                    <div className="w-[110px] flex justify-center">
                                                        <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                                    </div>

                                                    {app.status === 'CONFIRMED' && (
                                                        <div className="w-[100px] flex justify-center">
                                                            <AbsentButton appointmentId={app.id} />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {app.status === 'COMPLETED' && (
                                                <span className="text-[10px] font-black uppercase text-stone-300 tracking-widest italic pr-4">Sessão Finalizada</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center bg-stone-50/10">
                                        <h5 className="text-xl font-light text-stone-400 tracking-tight">Nenhum agendamento <span className="italic">encontrado</span> para este filtro.</h5>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DropdownFilter({ current, onChange, options }: { current: string | null, onChange: (val: string | null) => void, options: { label: string, value: string | null }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 rounded-xl bg-stone-50 text-stone-400 hover:text-stone-900 gap-2 font-bold text-[10px] uppercase tracking-widest group px-6"
            >
                <Filter size={14} className={cn("transition-colors", current ? "text-stone-900" : "text-stone-300")} />
                {options.find(o => o.value === current)?.label || "Filtros"}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {options.map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={cn(
                                    "w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest transition-colors hover:bg-stone-50",
                                    current === opt.value ? "text-stone-900 bg-stone-50" : "text-stone-400"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
