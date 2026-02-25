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
    ArrowLeft,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EvolutionDialog } from "@/components/EvolutionDialog";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { EvolutionHistory } from "@/components/EvolutionHistory";

export const dynamic = "force-dynamic";

export default async function PatientRecordPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = await params;

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            appointments: {
                include: {
                    payment: true,
                    evolution: true
                },
                orderBy: { startTime: 'desc' }
            },
            attachments: {
                orderBy: { createdAt: 'desc' }
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

    const now = new Date();
    const pastAppointments = (patient.appointments as any[]).filter(a => new Date(a.startTime) < now);
    const futureAppointments = (patient.appointments as any[]).filter(a => new Date(a.startTime) >= now).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const totalSessions = patient.appointments.length;
    const confirmedSessions = (patient.appointments as any[]).filter(a => a.status === 'CONFIRMED').length;
    const lastSession = pastAppointments[0];
    const nextSession = futureAppointments[0];

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
                    {/* Habilitamos a nova evolução aqui */}
                    <EvolutionDialog patientId={patient.id} appointmentId={lastSession?.id || "new"} />
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
                            Desde {format(patient.createdAt, 'dd/MM/yyyy')}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 text-stone-400">
                        <History size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Frequência</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-light text-stone-900">{totalSessions}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Sessões Totais</p>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            <span className="text-emerald-600 font-bold">{confirmedSessions}</span> confirmadas
                        </p>
                    </div>
                </div>

                {/* Card Unificado: Última e Próxima Sessão */}
                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 z-0" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 text-stone-400">
                                <History size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Última</span>
                            </div>
                            {lastSession ? (
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-stone-800 tracking-tight">
                                        {format(new Date(lastSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                                        {format(new Date(lastSession.startTime), "HH:mm")} • {lastSession.type}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-stone-300 italic">Sem histórico.</p>
                            )}
                        </div>

                        <div className="w-px bg-stone-100 hidden md:block" />

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 text-amber-600">
                                <Calendar size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Próxima</span>
                            </div>
                            {nextSession ? (
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-stone-900 tracking-tight">
                                        {format(new Date(nextSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                                        {format(new Date(nextSession.startTime), "HH:mm")} • {nextSession.type}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Agendado</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-stone-300 italic">Nenhuma marcada.</p>
                                    <Link href="/area-clinica/agenda">
                                        <Button variant="outline" className="h-7 text-[8px] font-black uppercase tracking-widest rounded-lg px-3 border-stone-200">Agendar</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs Simulation / Content Sections */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Evolution History with Filter */}
                <div className="lg:col-span-2">
                    <EvolutionHistory appointments={patient.appointments} patientId={patient.id} />
                </div>

                {/* Sidebar Info: Files, Finance, etc */}
                <div className="space-y-8">
                    {/* Finance Card */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Financeiro</h3>
                            <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500 font-medium">Valor/Sessão</span>
                                <span className="text-sm font-bold text-stone-900">R$ 180,00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500 font-medium">Situação</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100/50">
                                    <CheckCircle2 size={10} /> Em dia
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl h-10 border-stone-200 text-stone-600 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50">
                            Gerar Recibo PIX
                        </Button>
                    </div>

                    {/* Files/Attachments Card - Habilitado */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                        <AttachmentUpload patientId={patient.id} />

                        {/* Listagem de arquivos se houver */}
                        {patient.attachments.length > 0 && (
                            <div className="mt-6 space-y-2">
                                {patient.attachments.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-stone-200 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-stone-400 shadow-sm">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-stone-800 tracking-tight line-clamp-1">{file.name}</p>
                                                <p className="text-[8px] text-stone-400 font-black uppercase tracking-widest">{format(new Date(file.createdAt), 'dd MMM yyyy')}</p>
                                            </div>
                                        </div>
                                        <a href={file.url} className="text-stone-300 hover:text-stone-900 transition-colors opacity-0 group-hover:opacity-100">
                                            <Clock size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
