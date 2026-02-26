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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                        <User size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identificação</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-xs text-stone-600">
                            <Phone size={12} className="text-stone-300" />
                            {patient.phone}
                        </div>
                        {patient.email && (
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                                <Mail size={12} className="text-stone-300" />
                                {patient.email}
                            </div>
                        )}
                        <div className="text-[9px] text-stone-400 font-bold uppercase tracking-tight mt-1">
                            Desde {format(patient.createdAt, 'dd/MM/yyyy')}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                        <History size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Frequência</span>
                    </div>
                    <div className="pt-1">
                        <p className="text-2xl font-light text-stone-900 leading-none">{totalSessions}</p>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Sessões Totais</p>
                        <p className="text-[10px] text-stone-500 font-medium mt-1">
                            <span className="text-emerald-600 font-bold">{confirmedSessions}</span> confirmadas
                        </p>
                    </div>
                </div>

                {/* Card Unificado: Última e Próxima Sessão */}
                <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 space-y-2 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden flex items-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 z-0" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 w-full items-center">
                        <div className="flex-1 space-y-1 w-full">
                            <div className="flex items-center gap-2 text-stone-400 mb-2">
                                <History size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Última</span>
                            </div>
                            {lastSession ? (
                                <>
                                    <p className="text-base font-bold text-stone-800 tracking-tight leading-none">
                                        {format(new Date(lastSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                                        {format(new Date(lastSession.startTime), "HH:mm")} • {lastSession.type}
                                    </p>
                                </>
                            ) : (
                                <p className="text-[10px] text-stone-300 italic">Sem histórico.</p>
                            )}
                        </div>

                        <div className="w-px h-10 bg-stone-100 hidden md:block" />

                        <div className="flex-1 space-y-1 w-full">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <Calendar size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Próxima</span>
                            </div>
                            {nextSession ? (
                                <>
                                    <p className="text-base font-bold text-stone-900 tracking-tight leading-none">
                                        {format(new Date(nextSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                                        {format(new Date(nextSession.startTime), "HH:mm")} • {nextSession.type}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Agendado</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-stone-300 italic">Nenhuma marcada.</p>
                                    <Link href="/area-clinica/agenda">
                                        <Button variant="outline" className="h-6 text-[8px] font-black uppercase tracking-widest rounded px-2 border-stone-200">Agendar</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Evolution History without sidebar */}
            <div>
                <EvolutionHistory appointments={patient.appointments} patientId={patient.id} />
            </div>
        </div>
    );
}
