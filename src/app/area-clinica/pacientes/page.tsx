import Link from "next/link";
import prisma from "@/lib/prisma";
import { Users, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PatientsList() {
    const patients = await prisma.patient.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { appointments: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">Gestão de Pacientes</h2>
                    <p className="text-sm text-stone-500 font-medium italic mt-1">
                        Visualize e gerencie todos os prontuários ativos no sistema.
                    </p>
                </div>
                <Button className="h-11 rounded-xl px-6 bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-200 gap-2">
                    <Plus size={18} />
                    Novo Paciente
                </Button>
            </header>

            <div className="bg-white border rounded-xl shadow-sm border-stone-200 overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                            <input
                                placeholder="Buscar por nome ou WhatsApp..."
                                className="w-full h-9 pl-10 pr-4 text-xs bg-white border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-stone-100 transition-all font-medium"
                            />
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-stone-400 gap-1.5 font-bold">
                            <Filter size={14} /> Filtrar
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead className="bg-stone-100/50 border-b border-stone-200">
                            <tr>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500">Nome do Paciente</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[150px]">WhatsApp</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[100px]">Sessões</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[150px]">Desde</th>
                                <th className="py-2 text-center font-bold text-stone-500 w-[120px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {patients.length > 0 ? patients.map((patient, idx) => (
                                <tr key={patient.id} className={idx % 2 === 1 ? "bg-stone-50/30" : "bg-white"}>
                                    <td className="py-3 px-4 border-r border-stone-200 font-bold text-stone-700">
                                        {patient.name}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200 font-mono text-stone-500">
                                        {patient.phone}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200 text-center font-bold text-stone-500">
                                        {patient._count.appointments}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200 text-stone-400">
                                        {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Link href={`/area-clinica/prontuarios/${patient.id}`}>
                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary">
                                                Ver Prontuário
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center italic text-stone-400">
                                        Nenhum paciente encontrado.
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
