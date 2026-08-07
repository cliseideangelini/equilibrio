"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
    id: string;
    name: string;
    phone: string;
    createdAt: Date | string;
    _count: {
        appointments: number;
    };
    hasAppointmentThisWeek: boolean;
    nextAppointmentDate: Date | string | null;
}

interface PatientsClientProps {
    initialPatients: Patient[];
}

export function PatientsClient({ initialPatients }: PatientsClientProps) {
    const [search, setSearch] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredPatients = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) {
            // Sem busca: por padrão mostra só quem tem consulta esta semana, a menos que "Ver todos" esteja ativo
            return showAll ? initialPatients : initialPatients.filter(p => p.hasAppointmentThisWeek);
        }

        // Se houver busca, mostrar todos que batem com o termo
        return initialPatients.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.phone.includes(query)
        );
    }, [initialPatients, search, showAll]);

    // Reset para página 1 quando buscar ou trocar o filtro
    useMemo(() => {
        setCurrentPage(1);
    }, [search, showAll]);

    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface/40 p-2 rounded-[2rem] border border-border/80 shadow-sm backdrop-blur-md">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-muted-fg pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nome ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-semibold text-foreground placeholder:text-muted-fg w-full h-10"
                    />
                </div>
                {!search && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={cn(
                            "h-10 px-5 mr-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap",
                            showAll
                                ? "bg-primary text-white shadow-sm"
                                : "bg-surface/80 border border-border/80 text-muted-fg hover:text-foreground"
                        )}
                    >
                        {showAll ? "Mostrando Todos" : "Ver Todos os Pacientes"}
                    </button>
                )}
            </div>

            {/* Patients Grid (Table Format) */}
            <div className="bg-surface/20 border border-border/80 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-surface/50 border-b border-border/80">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">WhatsApp</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Próxima Consulta</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg text-center">Sessões</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {paginatedPatients.length > 0 ? paginatedPatients.map((patient, idx) => (
                                <tr key={patient.id} className={cn(
                                    "hover:bg-surface/40 transition-all group border-b border-border/40",
                                    idx % 2 === 1 ? "bg-surface/10" : "bg-transparent"
                                )}>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-surface/80 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-foreground transition-all shadow-sm border border-border/80 font-black text-[11px] uppercase tracking-widest">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors tracking-tight">{patient.name}</h4>
                                                {patient.hasAppointmentThisWeek && (
                                                    <span className="text-[9px] text-primary font-black uppercase tracking-widest flex items-center gap-1 mt-0.5 shadow-[0_0_10px_rgba(29,184,127,0.15)]">
                                                        <Calendar size={10} /> Agendado esta semana
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap font-mono text-[11px] text-muted-fg">
                                        {patient.phone}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {patient.nextAppointmentDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-foreground">
                                                    {format(new Date(patient.nextAppointmentDate), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-muted-fg font-mono">
                                                    {format(new Date(patient.nextAppointmentDate), "EEEE', às ' HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-fg/40 italic">Sem consulta futura</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface/80 text-primary border border-border/80 text-[11px] font-black">
                                            {patient._count.appointments}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-right">
                                        <Link href={`/area-clinica/prontuarios/${patient.id}`}>
                                            <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl border-border/80 text-[9px] font-black uppercase tracking-widest text-muted-fg hover:text-foreground hover:bg-surface/85 transition-all gap-2">
                                                Ver Prontuário <ChevronRight size={12} className="text-primary" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <User className="w-12 h-12 text-muted-fg/40 mx-auto mb-4" />
                                        <h5 className="text-xl font-light text-muted-fg tracking-tight">Nenhum paciente <span className="italic">encontrado</span>.</h5>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-muted-fg font-medium">
                        Mostrando <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> de <span className="text-foreground">{filteredPatients.length}</span> pacientes
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="h-8 w-8 p-0 rounded-lg border-border/80"
                        >
                            <ChevronLeft size={14} />
                        </Button>
                        <span className="text-xs font-bold text-foreground mx-2">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="h-8 w-8 p-0 rounded-lg border-border/80"
                        >
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

