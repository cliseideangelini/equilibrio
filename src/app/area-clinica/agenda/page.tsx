import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Video,
    MapPin,
    MoreVertical,
    Search,
    Filter,
    Download,
    Printer,
    FileSpreadsheet,
    Clock,
    ChevronRight,
    ExternalLink
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight leading-tight">Agenda <span className="italic font-serif text-stone-500">do Dia</span></h2>
                    <p className="text-stone-400 font-medium text-sm mt-1 flex items-center gap-2">
                        {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        {appointments.length} Sessões Agendadas
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl bg-white border-stone-100 text-stone-500 hover:text-stone-900 transition-all font-bold text-[10px] uppercase tracking-widest gap-2">
                        <Download size={14} /> Exportar Planilha
                    </Button>
                    <Button className="h-10 px-8 rounded-2xl bg-stone-900 border-0 text-white hover:bg-stone-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200">
                        <Printer size={14} className="mr-2" /> Imprimir
                    </Button>
                </div>
            </header>

            {/* Premium spreadsheet-style control bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 p-2 rounded-[2rem] border border-stone-100">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-stone-300 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Pesquisar por paciente, hora ou modalidade..."
                        className="bg-transparent border-0 outline-none text-sm font-medium text-stone-600 placeholder:text-stone-300 w-full"
                    />
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <Button variant="ghost" className="h-10 rounded-2xl text-stone-400 hover:text-stone-900 gap-2 font-bold text-[10px] uppercase tracking-widest group">
                        <Filter size={14} className="text-stone-300 transition-colors group-hover:text-stone-900" /> Filtros Avançados
                    </Button>
                </div>
            </div>

            {/* The "Excel" Style Grid - Redesigned as a Premium Spreadsheet */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/40 overflow-hidden">
                <div className="p-6 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-lg shadow-stone-200">
                            <FileSpreadsheet size={16} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-900">Visão Planilha de Atendimento</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-stone-50/30 border-b border-stone-100">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[140px] select-none">Horário</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 select-none">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[150px] select-none">WhatsApp</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[140px] select-none">Modalidade</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[120px] select-none">Status</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[120px] select-none">Pagamento</th>
                                <th className="py-4 px-8 text-center font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 w-[160px] select-none">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {appointments.length > 0 ? appointments.map((app, idx) => (
                                <tr key={app.id} className={cn(
                                    "hover:bg-stone-50/50 transition-all group",
                                    idx % 2 === 1 ? "bg-stone-50/10" : "bg-white"
                                )}>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-stone-900 shadow-sm" />
                                            <span className="text-sm font-black text-stone-900 font-mono tracking-tight leading-none italic">{format(app.startTime, 'HH:mm')}</span>
                                            <ChevronRight size={12} className="text-stone-200" />
                                            <span className="text-[10px] font-bold text-stone-400 font-mono tracking-tight leading-none">{format(app.endTime, 'HH:mm')}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-stone-100 flex items-center justify-center text-stone-400 group-hover:scale-110 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm border border-stone-200/50">
                                                <span className="font-black text-[10px] uppercase tracking-widest">{app.patient.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800 tracking-tight group-hover:text-stone-900 transition-colors">{app.patient.name}</h4>
                                                <p className="text-[10px] text-stone-400 font-medium italic mt-0.5">Paciente verificado</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <span className="text-[11px] font-bold font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">{app.patient.phone}</span>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap text-sm font-semibold text-stone-500">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-50 text-stone-500 rounded-[1rem] border border-stone-100 shadow-sm group-hover:border-stone-200 transition-colors">
                                            {app.type === 'ONLINE' ? (
                                                <Video size={10} className="text-blue-500" />
                                            ) : (
                                                <MapPin size={10} className="text-stone-500" />
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">
                                                {app.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                            app.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                                app.status === 'CANCELLED' ? "bg-red-50 text-red-600 border-red-100/50" :
                                                    "bg-amber-50 text-amber-600 border-amber-100/50"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full mr-2",
                                                app.status === 'CONFIRMED' ? "bg-emerald-500 shadow-emerald-500/20 shadow-lg" :
                                                    app.status === 'CANCELLED' ? "bg-red-500 shadow-red-500/20 shadow-lg" :
                                                        "bg-amber-500 shadow-amber-500/20 shadow-lg"
                                            )} />
                                            {app.status === 'CONFIRMED' ? 'Confirmado' :
                                                app.status === 'CANCELLED' ? 'Cancelado' : 'Aguardando'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                            app.payment?.status === 'PAID' ? "bg-stone-50 text-stone-700 border-stone-200/50" :
                                                "bg-stone-50/50 text-stone-300 border-stone-100/50"
                                        )}>
                                            {app.payment?.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-3">
                                            {app.type === 'ONLINE' && app.meetLink && (
                                                <Button asChild size="sm" className="h-9 px-5 rounded-[1.2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider shadow-lg shadow-blue-500/20 border-0 group/meet">
                                                    <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">
                                                        Abrir Meet <ExternalLink size={12} className="ml-1.5 group-hover/meet:translate-x-0.5 transition-transform" />
                                                    </a>
                                                </Button>
                                            )}
                                            <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-32 text-center bg-stone-50/10">
                                        <FileSpreadsheet className="w-16 h-16 text-stone-100 mx-auto mb-6" />
                                        <h5 className="text-xl font-light text-stone-400 tracking-tight">Sem atividades <span className="italic">registradas</span> no momento.</h5>
                                        <p className="mt-4 text-stone-300 text-[10px] font-black uppercase tracking-[0.3em] leading-none">Novos agendamentos aparecerão aqui</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer status bar like excel/notion */}
                <div className="px-8 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] select-none">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sistema Operacional</span>
                        <span className="flex items-center gap-2 underline decoration-stone-200 underline-offset-4 pointer-events-none">{appointments.length} Consultas Listadas</span>
                    </div>
                    <div>
                        Sincronizado: {format(new Date(), 'HH:mm:ss')}
                    </div>
                </div>
            </div>
        </div>
    );
}
