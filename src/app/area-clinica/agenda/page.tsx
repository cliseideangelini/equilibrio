import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Video,
    MapPin,
    MoreVertical,
    Calendar,
    Download,
    Printer,
    FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancellationButton } from "@/components/CancellationButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClinicianAgenda() {
    const today = new Date();

    // Buscar agendamentos de hoje
    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            }
        },
        include: {
            patient: true,
            payment: true
        },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div className="space-y-6">
            {/* Context Header */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">Agenda de Hoje</h2>
                    <p className="text-sm text-stone-500 font-medium italic mt-1">
                        {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white border-stone-200 text-stone-600 gap-2 hover:bg-stone-50">
                        <Download size={14} /> Exportar CSV
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white border-stone-200 text-stone-600 gap-2 hover:bg-stone-50">
                        <Printer size={14} /> Imprimir
                    </Button>
                </div>
            </header>

            {/* Excel Style Grid */}
            <div className="bg-white border rounded-xl shadow-sm border-stone-200 overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-stone-400" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">Visão Planilha Geral</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead className="bg-stone-100/50 border-b border-stone-200">
                            <tr>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[100px]">Horário</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500">Paciente</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[120px]">WhatsApp</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[100px]">Modalidade</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[100px]">Status</th>
                                <th className="py-2 px-4 border-r border-stone-200 text-left font-bold text-stone-500 w-[100px]">Pagamento</th>
                                <th className="py-2 px-4 text-center font-bold text-stone-500 w-[120px]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {appointments.length > 0 ? appointments.map((app, idx) => (
                                <tr key={app.id} className={cn(
                                    "hover:bg-primary/[0.02] transition-colors",
                                    idx % 2 === 1 ? "bg-stone-50/30" : "bg-white"
                                )}>
                                    <td className="py-3 px-4 border-r border-stone-200 font-mono font-bold text-stone-800 bg-stone-50/20">
                                        {format(app.startTime, 'HH:mm')} - {format(app.endTime, 'HH:mm')}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200 font-bold text-stone-700">
                                        {app.patient.name}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200 font-mono text-stone-500">
                                        {app.patient.phone}
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200">
                                        <div className="flex items-center gap-1.5">
                                            {app.type === 'ONLINE' ? (
                                                <Video size={10} className="text-blue-500" />
                                            ) : (
                                                <MapPin size={10} className="text-stone-400" />
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                                {app.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                            app.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                app.status === 'CANCELLED' ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {app.status === 'CONFIRMED' ? 'Confirmado' :
                                                app.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-r border-stone-200">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                            app.payment?.status === 'PAID' ? "bg-stone-50 text-stone-600 border-stone-100" :
                                                "bg-stone-50 text-stone-300 border-stone-100"
                                        )}>
                                            {app.payment?.status === 'PAID' ? 'Pago' : 'Não Pago'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {app.type === 'ONLINE' && app.meetLink && (
                                                <Button asChild size="sm" className="h-6 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[8px] uppercase tracking-widest shadow-sm border-0">
                                                    <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">Abrir Meet</a>
                                                </Button>
                                            )}
                                            <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center bg-stone-50/10 italic text-stone-400">
                                        Nenhum compromisso agendado para hoje.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-2 bg-stone-100 border-t border-stone-200 text-[10px] text-stone-400 font-medium">
                    Mostrando {appointments.length} registros • Última atualização: {format(new Date(), 'HH:mm:ss')}
                </div>
            </div>

            {/* Patients and Other links below can be added as cards if needed */}
        </div>
    );
}
