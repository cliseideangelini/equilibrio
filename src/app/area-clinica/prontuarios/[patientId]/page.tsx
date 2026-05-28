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
    CheckCircle2,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EvolutionDialog } from "@/components/EvolutionDialog";
import { AttachmentUpload } from "@/components/AttachmentUpload";
import { EvolutionHistory } from "@/components/EvolutionHistory";
import { ResetPasswordButton } from "@/components/ResetPasswordButton";

export const dynamic = "force-dynamic";

export default async function PatientRecordPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = await params;

    const patient = await prisma.patient.findFirst({
        where: { id: patientId, deletedAt: null },
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
            <div className="max-w-5xl mx-auto py-20 text-center relative z-10">
                <h1 className="text-2xl font-light text-muted-fg">Paciente não encontrado.</h1>
                <Link href="/area-clinica">
                    <Button variant="link" className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]">Voltar para o Painel</Button>
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
        <div className="space-y-8 pb-20 relative z-10">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <Link href="/area-clinica/prontuarios">
                        <div className="w-10 h-10 rounded-full bg-surface/50 border border-border/80 flex items-center justify-center text-muted-fg hover:text-foreground hover:border-primary transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </div>
                    </Link>
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                <Sparkles className="w-2 h-2" /> Histórico Clínico
                            </span>
                        </div>
                        <h1 className="text-3xl font-light text-foreground tracking-tight">{patient.name}</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <EvolutionDialog patientId={patient.id} appointmentId={lastSession?.id || "new"} />
                </div>
            </div>

            {/* Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-surface/30 border border-border/80 rounded-2xl p-4 space-y-2 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-muted-fg">
                        <User size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identificação</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-xs text-foreground">
                            <Phone size={12} className="text-primary/70" />
                            {patient.phone}
                        </div>
                        {patient.email && (
                            <div className="flex items-center gap-2 text-xs text-foreground">
                                <Mail size={12} className="text-primary/70" />
                                {patient.email}
                            </div>
                        )}
                        <div className="text-[9px] text-muted-fg font-bold uppercase tracking-tight mt-1">
                            Desde {format(patient.createdAt, 'dd/MM/yyyy')}
                        </div>
                        <ResetPasswordButton patientId={patient.id} />
                    </div>
                </div>

                <div className="bg-surface/30 border border-border/80 rounded-2xl p-4 space-y-2 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-muted-fg">
                        <History size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Frequência</span>
                    </div>
                    <div className="pt-1">
                        <p className="text-2xl font-light text-foreground leading-none">{totalSessions}</p>
                        <p className="text-[9px] text-muted-fg font-bold uppercase tracking-widest mt-1">Sessões Totais</p>
                        <p className="text-[10px] text-muted-fg font-medium mt-1">
                            <span className="text-primary font-bold">{confirmedSessions}</span> confirmadas
                        </p>
                    </div>
                </div>

                {/* Card Unificado: Última e Próxima Sessão */}
                <div className="bg-surface/30 border border-border/80 rounded-2xl px-5 py-4 space-y-2 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden flex items-center backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-surface/40 rounded-full -mr-16 -mt-16 z-0 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 w-full items-center">
                        <div className="flex-1 space-y-1 w-full">
                            <div className="flex items-center gap-2 text-muted-fg mb-2">
                                <History size={12} className="text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Última</span>
                            </div>
                            {lastSession ? (
                                <>
                                    <p className="text-base font-bold text-foreground tracking-tight leading-none">
                                        {format(new Date(lastSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-muted-fg font-bold uppercase tracking-widest mt-0.5">
                                        {format(new Date(lastSession.startTime), "HH:mm")} • {lastSession.type}
                                    </p>
                                </>
                            ) : (
                                <p className="text-[10px] text-muted-fg/40 italic">Sem histórico.</p>
                            )}
                        </div>

                        <div className="w-px h-10 bg-border/60 hidden md:block" />

                        <div className="flex-1 space-y-1 w-full">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Calendar size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Próxima</span>
                            </div>
                            {nextSession ? (
                                <>
                                    <p className="text-base font-bold text-foreground tracking-tight leading-none">
                                        {format(new Date(nextSession.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </p>
                                    <p className="text-[9px] text-muted-fg font-bold uppercase tracking-widest mt-0.5">
                                        {format(new Date(nextSession.startTime), "HH:mm")} • {nextSession.type}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Agendado</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-muted-fg/40 italic">Nenhuma marcada.</p>
                                    <Link href="/area-clinica/agenda">
                                        <Button variant="outline" className="h-6 text-[8px] font-black uppercase tracking-widest rounded px-2 border-border/80 hover:bg-surface/80 text-muted-fg hover:text-foreground">Agendar</Button>
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

