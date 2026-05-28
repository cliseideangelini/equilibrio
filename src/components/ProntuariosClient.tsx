"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, User, Calendar, BookOpen, Clock } from "lucide-react";
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
    hasAppointmentThisMonth: boolean;
    lastAppointmentDate: Date | string | null;
    nextAppointmentDate: Date | string | null;
}

interface ProntuariosClientProps {
    initialPatients: Patient[];
}

export function ProntuariosClient({ initialPatients }: ProntuariosClientProps) {
    const [search, setSearch] = useState("");

    const filteredPatients = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) {
            // Se não houver busca, mostrar apenas os pacientes que têm consulta este mês
            return initialPatients.filter(p => p.hasAppointmentThisMonth);
        }

        // Se houver busca, mostrar todos que batem com o termo
        return initialPatients.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.phone.includes(query)
        );
    }, [initialPatients, search]);

    return (
        <div className="space-y-8">
            {/* Control Bar */}
            <form 
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface/40 p-2 rounded-[2rem] border border-border/80 shadow-sm w-full backdrop-blur-md"
            >
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <button type="submit">
                        <Search className="text-muted-fg hover:text-foreground transition-colors" size={16} />
                    </button>
                    <input
                        type="text"
                        placeholder="Buscar prontuário por nome ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-semibold text-foreground placeholder:text-muted-fg w-full h-10"
                    />
                </div>
            </form>

            {/* Records Grid (Table Format) */}
            <div className="bg-surface/20 border border-border/80 rounded-[2.5rem] shadow-xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-surface/50 border-b border-border/80">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Último Atendimento</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Próxima Consulta</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg text-center">Sessões</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg text-center">Cadastro</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-muted-fg">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
                                <tr key={patient.id} className={cn(
                                    "hover:bg-surface/40 transition-all group border-b border-border/40",
                                    idx % 2 === 1 ? "bg-surface/10" : "bg-transparent"
                                )}>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-surface/80 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-foreground transition-all shadow-sm border border-border/80 font-black text-[11px] uppercase tracking-widest">
                                                <BookOpen size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{patient.name}</h4>
                                                <p className="text-[10px] text-muted-fg font-mono italic">{patient.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {patient.lastAppointmentDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-foreground">
                                                    {format(new Date(patient.lastAppointmentDate), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-muted-fg font-mono" suppressHydrationWarning>
                                                    Há {Math.floor((new Date().getTime() - new Date(patient.lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-fg/40 italic">Sem atendimentos</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {patient.nextAppointmentDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-primary">
                                                    {format(new Date(patient.nextAppointmentDate), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-primary/70 font-mono">
                                                    {format(new Date(patient.nextAppointmentDate), "EEEE', às ' HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-fg/40 italic">Sem agendamento</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface/80 text-primary border border-border/80 text-[11px] font-black">
                                            {patient._count.appointments}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center text-[10px] text-muted-fg font-mono">
                                        {format(new Date(patient.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-right">
                                        <Link href={`/area-clinica/prontuarios/${patient.id}`}>
                                            <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl border-border/80 text-[9px] font-black uppercase tracking-widest text-muted-fg hover:text-foreground hover:bg-surface/85 transition-all gap-2 shadow-sm">
                                                Abrir Prontuário <ChevronRight size={12} className="text-primary" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <User className="w-12 h-12 text-muted-fg/40 mx-auto mb-4" />
                                        <h5 className="text-xl font-light text-muted-fg tracking-tight">Nenhum prontuário <span className="italic">localizado</span>.</h5>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg mt-2">Use a busca para ver pacientes de outros meses</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!search && initialPatients.length > filteredPatients.length && (
                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg pt-8 animate-pulse">
                    Use a barra de busca para encontrar prontuários de outros meses
                </p>
            )}
        </div>
    );
}

