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
import Link from "next/link";

interface Appointment {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
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
    initialDate: string | Date;
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
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface/40 p-2 rounded-[2rem] border border-border/80 shadow-sm backdrop-blur-md">
                <form 
                    className="flex flex-1 items-center gap-2 px-4 w-full"
                    onSubmit={(e) => { e.preventDefault(); setSearch(search); }}
                >
                    <button type="submit">
                        <Search className="text-muted-fg hover:text-foreground transition-colors" size={16} />
                    </button>
                    <input
                        type="text"
                        placeholder="Pesquisar por paciente ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-semibold text-foreground placeholder:text-muted-fg w-full"
                    />
                </form>

                <div className="flex items-center gap-3 pr-2 w-full md:w-auto">
                    {/* Seletor de Data */}
                    <div className="relative group">
                        <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg group-hover:text-foreground transition-colors pointer-events-none" />
                        <input
                            type="date"
                            defaultValue={format(new Date(initialDate), "yyyy-MM-dd")}
                            onChange={handleDateChange}
                            className="h-10 pl-11 pr-4 rounded-xl bg-surface/75 border border-border/80 text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-surface transition-all"
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
            <div className="bg-surface/20 border border-border/80 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-surface/50 border-b border-border/80">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg w-[140px]">Horário</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg w-[140px]">Modalidade</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg w-[120px]">Status</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg w-[400px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredAppointments.length > 0 ? filteredAppointments.map((app, idx) => (
                                <tr key={app.id} className={cn(
                                    "hover:bg-surface/40 transition-all group border-b border-border/40",
                                    idx % 2 === 1 ? "bg-surface/10" : "bg-transparent"
                                )}>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(29,184,127,0.5)]" />
                                            <span className="text-sm font-black text-foreground font-mono italic">{format(new Date(app.startTime), 'HH:mm')}</span>
                                            <ChevronRight size={12} className="text-muted-fg" />
                                            <span className="text-[10px] font-bold text-muted-fg font-mono">{format(new Date(app.endTime), 'HH:mm')}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-surface/80 flex items-center justify-center text-primary transition-all shadow-sm border border-border/80">
                                                <span className="font-black text-[10px] uppercase tracking-widest">{app.patient.name.charAt(0)}</span>
                                            </div>
                                            <Link href={`/area-clinica/prontuarios/${app.patient.id}`} className="hover:opacity-75 transition-opacity">
                                                <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors tracking-tight">{app.patient.name}</h4>
                                                <p className="text-[10px] text-muted-fg font-mono italic">{app.patient.phone}</p>
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        {app.type === 'ONLINE' && app.meetLink ? (
                                            <a
                                                href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-400/10 text-blue-400 rounded-[1rem] border border-blue-400/20 shadow-sm hover:bg-blue-400/20 transition-all group/link"
                                            >
                                                <Video size={10} className="text-blue-400 group-hover/link:scale-110 transition-transform" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                                    {app.type}
                                                </span>
                                            </a>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface/50 text-muted-fg rounded-[1rem] border border-border shadow-sm">
                                                {app.type === 'ONLINE' ? (
                                                    <Video size={10} className="text-blue-400" />
                                                ) : (
                                                    <MapPin size={10} className="text-warm" />
                                                )}
                                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                                    {app.type}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                            app.status === 'CONFIRMED' ? "bg-blue-400/10 text-blue-400 border-blue-400/20" :
                                                app.status === 'COMPLETED' ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_-2px_rgba(29,184,127,0.3)]" :
                                                    app.status === 'CANCELLED' ? "bg-surface border-border text-muted-fg" :
                                                        app.status === 'ABSENT' ? "bg-rose-400/10 text-rose-400 border-rose-400/20" :
                                                            "bg-surface border-border text-muted-fg"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full mr-2",
                                                app.status === 'CONFIRMED' ? "bg-blue-400" :
                                                    app.status === 'COMPLETED' ? "bg-primary shadow-[0_0_6px_rgba(29,184,127,0.5)]" :
                                                        app.status === 'CANCELLED' ? "bg-muted-fg" :
                                                            "bg-rose-400"
                                            )} />
                                            {app.status === 'CONFIRMED' ? 'Confirmado' :
                                                app.status === 'COMPLETED' ? 'Realizado' :
                                                    app.status === 'CANCELLED' ? 'Cancelado' :
                                                        app.status === 'ABSENT' ? 'Falta' : 'Aguardando'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                            {app.status === 'COMPLETED' ? (
                                                <span className="text-[10px] font-bold uppercase text-muted-fg tracking-widest italic pr-4">Sessão Finalizada</span>
                                            ) : app.status === 'CANCELLED' ? (
                                                <span className="text-[10px] font-bold uppercase text-muted-fg tracking-widest italic pr-4">Cancelada</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2 pr-2">
                                                    {app.status === 'CONFIRMED' && (
                                                        <AbsentButton
                                                            appointmentId={app.id}
                                                            variant="outline"
                                                            className="h-8 px-4 rounded-xl border-amber-500/25 bg-amber-500/5 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40 hover:text-amber-300 transition-all"
                                                        />
                                                    )}
                                                    <CancellationButton
                                                        appointmentId={app.id}
                                                        startTime={new Date(app.startTime).toISOString()}
                                                        variant="outline"
                                                        className="h-8 px-4 rounded-xl border-rose-500/25 bg-rose-500/5 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-300 transition-all"
                                                    />
                                                </div>
                                            )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <h5 className="text-xl font-light text-muted-fg tracking-tight">Nenhum agendamento <span className="italic">encontrado</span> para este filtro.</h5>
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
                className="h-10 rounded-xl bg-surface/80 border border-border/80 text-muted-fg hover:text-foreground gap-2 font-bold text-[10px] uppercase tracking-widest group px-6"
            >
                <Filter size={14} className={cn("transition-colors", current ? "text-foreground" : "text-muted-fg")} />
                {options.find(o => o.value === current)?.label || "Filtros"}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border/80 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {options.map(opt => (
                            <button
                                key={opt.label}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={cn(
                                    "w-full px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest transition-colors hover:bg-surface/80",
                                    current === opt.value ? "text-primary bg-primary/10" : "text-muted-fg"
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

