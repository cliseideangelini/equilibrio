import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    FileText,
    History,
    DollarSign,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PatientRecordPage({ params }: { params: { patientId: string } }) {
    const { patientId } = params;

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            appointments: {
                include: { payment: true },
                orderBy: { startTime: 'desc' }
            }
        }
    });

    if (!patient) {
        return (
            <div className="max-w-5xl mx-auto py-20 text-center">
                <h1 className="text-2xl font-light text-stone-400">Paciente não encontrado.</h1>
                <Link href="/area-clinica">
                    <Button variant="link" className="mt-4 text-stone-900 font-bold uppercase tracking-widest text-[10px]">Voltar para o Painel</Button>
                </Link>
            </div>
        );
    }

    const totalSessions = patient.appointments.length;
    const confirmedSessions = patient.appointments.filter(a => a.status === 'CONFIRMED').length;
    const lastSession = patient.appointments[0];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <Link href="/area-clinica">
                        <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </div>
                    </Link>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Prontuário Clínico</p>
                        <h1 className="text-3xl font-light text-stone-900 tracking-tight">{patient.name}</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button className="rounded-xl bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest h-10 px-6 border-0">
                        <Plus size={14} className="mr-2" /> Nova Evolução
                    </Button>
                </div>
            </div>

            {/* Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 text-stone-400">
                        <User size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Identificação</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Phone size={14} className="text-stone-300" />
                            {patient.phone}
                        </div>
                        {patient.email && (
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                <Mail size={14} className="text-stone-300" />
                                {patient.email}
                            </div>
                        )}
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tight mt-2">
                            Paciente desde {format(patient.createdAt, 'MMMM/yyyy', { locale: ptBR })}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 text-stone-400">
                        <History size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Atendimento</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-light text-stone-900">{totalSessions}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Sessões Totais</p>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            <span className="text-emerald-600 font-bold">{confirmedSessions}</span> confirmadas
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 text-stone-400">
                        <Calendar size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Última Sessão</span>
                    </div>
                    {lastSession ? (
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-stone-800 tracking-tight">
                                {format(lastSession.startTime, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                {format(lastSession.startTime, "HH:mm")} • {lastSession.type}
                            </p>
                            <span className={cn(
                                "inline-block px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest mt-2 border",
                                lastSession.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-stone-50 text-stone-400 border-stone-100"
                            )}>
                                {lastSession.status}
                            </span>
                        </div>
                    ) : (
                        <p className="text-xs text-stone-400 italic">Nenhum histórico.</p>
                    )}
                </div>

                <div className="bg-stone-900 border-none rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3 text-stone-500">
                        <FileText size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Clínico</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[70%]" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Prontuário Completo</p>
                        <p className="text-stone-300 text-xs font-medium leading-relaxed italic">Atendimento contínuo em evolução...</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs Simulation / Content Sections */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Evolution History */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Linha do Tempo / Evoluções</h3>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Filtrar por data</span>
                    </div>
                    <div className="space-y-4">
                        {patient.appointments.map((app, i) => (
                            <div key={app.id} className="bg-white border border-stone-200 rounded-2xl p-6 transition-all hover:border-stone-300 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-stone-100 group-hover:bg-stone-900 transition-colors" />
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center text-stone-400 font-black text-xs">
                                            {patient.appointments.length - i}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-stone-800 tracking-tight">
                                                Sessão de {format(app.startTime, "eeee, dd 'de' MMMM", { locale: ptBR })}
                                            </p>
                                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                                {format(app.startTime, "HH:mm")} às {format(app.endTime, "HH:mm")} • Modalidade {app.type}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                        app.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-stone-50 text-stone-400 border-stone-100"
                                    )}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="bg-stone-50/50 rounded-xl p-4 mt-4 border border-stone-100/50">
                                    <p className="text-xs text-stone-500 leading-relaxed italic">
                                        Nenhuma nota registrada para esta sessão ainda. Clique para adicionar observações clínicas.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info: Files, Finance, etc */}
                <div className="space-y-8">
                    {/* Finance Card */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Financeiro</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500 font-medium">Valor por Sessão</span>
                                <span className="text-sm font-bold text-stone-900">R$ 180,00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500 font-medium">Situação Atual</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Em dia</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl h-10 border-stone-200 text-stone-600 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50">
                            Gerar Recibo PIX
                        </Button>
                    </div>

                    {/* Files/Attachments Card */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Documentos</h3>
                        <div className="p-10 text-center border-2 border-dashed border-stone-50 rounded-xl">
                            <p className="text-[10px] text-stone-300 font-black uppercase tracking-widest">Nenhum arquivo anexado</p>
                        </div>
                        <Button variant="ghost" className="w-full text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-widest gap-2">
                            <Plus size={14} /> Fazer upload
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Plus({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}
