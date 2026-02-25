import prisma from "@/lib/prisma";
import Link from "next/link";
import { Search, User, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProntuariosIndex() {
    const patients = await prisma.patient.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { appointments: true }
            }
        }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Repositório Clínico</p>
                    <h1 className="text-4xl font-light text-stone-900 tracking-tight">Prontuários</h1>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                    <input
                        placeholder="Buscar prontuário por nome..."
                        className="w-full h-11 pl-10 pr-4 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-100 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                    <Link key={patient.id} href={`/area-clinica/prontuarios/${patient.id}`}>
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-900 hover:shadow-xl hover:shadow-stone-200/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm border border-stone-100">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-stone-800 tracking-tight leading-none mb-1 group-hover:text-stone-900">{patient.name}</h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                        {patient._count.appointments} sessões registradas
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-900 transition-colors">Acessar Histórico</span>
                                <ArrowRight size={14} className="text-stone-200 group-hover:text-stone-900 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {patients.length === 0 && (
                <div className="py-20 text-center bg-white border border-stone-100 rounded-3xl border-dashed">
                    <p className="text-stone-300 italic font-medium">Nenhum prontuário registrado ainda.</p>
                </div>
            )}
        </div>
    );
}
