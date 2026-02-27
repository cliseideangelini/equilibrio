"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, User, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
    id: string;
    name: string;
    phone: string;
    createdAt: Date;
    _count: {
        appointments: number;
    };
    hasAppointmentThisWeek: boolean;
}

interface PatientsClientProps {
    initialPatients: Patient[];
}

export function PatientsClient({ initialPatients }: PatientsClientProps) {
    const [search, setSearch] = useState("");

    const filteredPatients = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) {
            // Se não houver busca, mostrar apenas os da semana
            return initialPatients.filter(p => p.hasAppointmentThisWeek);
        }

        // Se houver busca, mostrar todos que batem com o termo
        return initialAppointmentsSearch(initialPatients, query);
    }, [initialPatients, search]);

    return (
        <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 p-2 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-stone-300 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nome ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium text-stone-600 placeholder:text-stone-300 w-full h-10"
                    />
                </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                    <Link
                        key={patient.id}
                        href={`/area-clinica/prontuarios/${patient.id}`}
                        className="group bg-white border border-stone-100 rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/40 hover:shadow-stone-200 transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-[1.8rem] bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm border border-stone-100 font-black text-lg uppercase">
                                {patient.name.charAt(0)}
                            </div>
                            {patient.hasAppointmentThisWeek && (
                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100/50">
                                    Agendado esta semana
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-bold text-stone-800 tracking-tight group-hover:text-stone-900 leading-tight">{patient.name}</h4>
                                <div className="flex items-center gap-2 mt-1 text-stone-400">
                                    <Phone size={12} />
                                    <span className="text-[11px] font-mono leading-none">{patient.phone}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">Total de Sessões</span>
                                    <span className="text-sm font-black text-stone-600">{patient._count.appointments}</span>
                                </div>
                                <div className="p-2 rounded-full bg-stone-50 text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="col-span-full py-20 text-center bg-stone-50/10 rounded-[2.5rem] border border-stone-100 border-dashed">
                        <User className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                        <h5 className="text-xl font-light text-stone-400 tracking-tight italic">Nenhum paciente encontrado.</h5>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 mt-2">Tente pesquisar por outro nome ou telefone</p>
                    </div>
                )}
            </div>

            {!search && initialPatients.length > filteredPatients.length && (
                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 pt-8 animate-pulse">
                    Use a barra de busca para encontrar outros pacientes
                </p>
            )}
        </div>
    );
}

function initialAppointmentsSearch(patients: Patient[], query: string) {
    return patients.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.phone.includes(query)
    );
}
