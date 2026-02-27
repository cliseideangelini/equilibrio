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
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 p-2 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-stone-300 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar prontuário por nome ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium text-stone-600 placeholder:text-stone-300 w-full h-10"
                    />
                </div>
            </div>

            {/* Records Grid (Table Format) */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-stone-50/30 border-b border-stone-100">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Último Atendimento</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Próxima Consulta</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 text-center">Sessões</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 text-center">Cadastro</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
                                <tr key={patient.id} className={cn(
                                    "hover:bg-stone-50/50 transition-all group",
                                    idx % 2 === 1 ? "bg-stone-50/10" : "bg-white"
                                )}>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm border border-stone-200/50 font-black text-[11px] uppercase tracking-widest">
                                                <BookOpen size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800 tracking-tight">{patient.name}</h4>
                                                <p className="text-[10px] text-stone-400 font-mono italic">{patient.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {patient.lastAppointmentDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-stone-700">
                                                    {format(new Date(patient.lastAppointmentDate), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-stone-300 font-mono">
                                                    Há {Math.floor((new Date().getTime() - new Date(patient.lastAppointmentDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-200 italic">Sem atendimentos</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {patient.nextAppointmentDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-emerald-700">
                                                    {format(new Date(patient.nextAppointmentDate), "dd 'de' MMMM", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-emerald-500/60 font-mono">
                                                    {format(new Date(patient.nextAppointmentDate), "EEEE', às ' HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-200 italic">Sem agendamento</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 text-stone-500 text-[11px] font-black border border-stone-100">
                                            {patient._count.appointments}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center text-[10px] text-stone-400 font-mono">
                                        {format(new Date(patient.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-right">
                                        <Link href={`/area-clinica/prontuarios/${patient.id}`}>
                                            <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl border-stone-100 text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all gap-2 shadow-sm">
                                                Abrir Prontuário <ChevronRight size={12} />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center bg-stone-50/10">
                                        <User className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                                        <h5 className="text-xl font-light text-stone-400 tracking-tight">Nenhum prontuário <span className="italic">localizado</span>.</h5>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-200 mt-2">Use a busca para ver pacientes de outros meses</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!search && initialPatients.length > filteredPatients.length && (
                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 pt-8 animate-pulse">
                    Use a barra de busca para encontrar prontuários de outros meses
                </p>
            )}
        </div>
    );
}
