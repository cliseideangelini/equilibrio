import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, MapPin, FileText, CheckCircle, Clock, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CompleteAppointmentButton } from "@/components/CompleteAppointmentButton";
import { AbsentButton } from "@/components/AbsentButton";
import { CancellationButton } from "@/components/CancellationButton";
import { NotifyAbsentButton } from "@/components/NotifyAbsentButton";
import { PsiDivider } from "@/components/PsiDivider";

import { getAppointmentsWithFixed } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AreaClinicaDashboard() {
    const today = new Date();

    const dailyAppointments = await getAppointmentsWithFixed(startOfDay(today), endOfDay(today));

    const pendingAppointments = dailyAppointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED");
    const completedAppointments = dailyAppointments.filter(a => a.status === "COMPLETED");
    const absentAppointments = dailyAppointments.filter(a => a.status === "ABSENT");

    // Dynamic Greeting
    const hour = today.getHours();
    let greeting = "Boa noite";
    if (hour >= 5 && hour < 12) greeting = "Bom dia";
    else if (hour >= 12 && hour < 18) greeting = "Boa tarde";

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12 pb-16 animate-in fade-in duration-700">

            {/* Header / Greeting */}
            <header className="flex flex-col gap-2 mb-10">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)]">
                        <Sparkles className="w-3 h-3" /> Painel de Controle
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">
                    {greeting}, <span className="text-gradient font-bold">{greeting === "Bom dia" || greeting === "Boa tarde" ? "Cliseide" : "Cliseide"}</span>.
                </h1>
                <p className="text-muted-fg text-lg">
                    Hoje é {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}. Você tem <strong className="text-primary font-semibold">{dailyAppointments.length} sessões</strong> programadas.
                </p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "A Realizar", value: pendingAppointments.length, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
                    { label: "Realizadas", value: completedAppointments.length, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                    { label: "Ausências", value: absentAppointments.length, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
                    { label: "Total do Dia", value: dailyAppointments.length, icon: FileText, color: "text-warm", bg: "bg-warm/10", border: "border-warm/20" },
                ].map((s, i) => (
                    <div key={i} className={cn("bg-surface/40 border rounded-2xl p-5 flex flex-col gap-4 shadow-sm backdrop-blur-md hover:translate-y-[-2px] transition-all duration-300", s.border)}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">{s.label}</span>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", s.bg, s.border)}>
                                <s.icon className={cn("w-4 h-4", s.color)} />
                            </div>
                        </div>
                        <p className="text-3xl font-light text-foreground">{s.value}</p>
                    </div>
                ))}
            </div>

            <PsiDivider />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Timeline - Left Column (takes 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Sessões de Hoje
                        </h2>
                        <Link href="/area-clinica/agenda" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                            Ver agenda completa <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {dailyAppointments.length === 0 ? (
                        <div className="bg-surface/30 border border-border/80 rounded-3xl p-12 text-center shadow-sm backdrop-blur-md">
                            <div className="w-16 h-16 rounded-full bg-surface/50 border border-border/80 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-muted-fg" />
                            </div>
                            <p className="text-lg font-medium text-foreground">Sua agenda está livre hoje.</p>
                            <p className="text-muted-fg text-sm mt-1">Aproveite o tempo para organizar seus prontuários.</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-border/60 ml-4 space-y-8 py-4">
                            {dailyAppointments.map((app) => {
                                const isCompleted = app.status === "COMPLETED";
                                const isAbsent = app.status === "ABSENT";
                                const isCancelled = app.status === "CANCELLED";
                                const isPast = isBefore(app.startTime, today) && !isCompleted && !isAbsent;

                                return (
                                    <div key={app.id} className="relative pl-8 group">
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute -left-1.5 top-5 w-3 h-3 rounded-full border border-background ring-4 ring-background/50",
                                            isCompleted ? "bg-primary" :
                                                isAbsent || isCancelled ? "bg-muted-fg" :
                                                    isPast ? "bg-amber-400 animate-pulse" :
                                                        "bg-primary shadow-[0_0_10px_2px_rgba(29,184,127,0.5)]"
                                        )} />

                                        {/* Card */}
                                        <div className={cn(
                                            "bg-surface/30 border rounded-2xl p-5 shadow-sm transition-all duration-300 backdrop-blur-md hover:border-border hover:bg-surface/40",
                                            isCompleted ? "border-primary/20 opacity-75" :
                                                isAbsent || isCancelled ? "border-border/40 opacity-60" :
                                                    "border-border/80"
                                        )}>
                                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                                
                                                {/* Time and Patient Info */}
                                                <div className="flex items-center gap-5">
                                                    <div className="text-center min-w-[70px]">
                                                        <span className="block text-2xl font-light text-foreground leading-none">
                                                            {format(app.startTime, "HH:mm")}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase tracking-wider mt-2 px-1.5 py-0.5 rounded-full inline-block",
                                                            isCompleted ? "bg-primary/10 text-primary border border-primary/20" : 
                                                            isAbsent ? "bg-rose-400/10 text-rose-400 border border-rose-400/20" : 
                                                            isCancelled ? "bg-muted-fg/10 text-muted-fg border border-border" : 
                                                            "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                                                        )}>
                                                            {app.status === "COMPLETED" ? "Finalizada" : app.status === "ABSENT" ? "Falta" : app.status === "CANCELLED" ? "Cancelada" : "Agendada"}
                                                        </span>
                                                    </div>

                                                    <div className="h-10 w-px bg-border/60 hidden sm:block" />

                                                    <div>
                                                        <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                                                            {app.patient?.name || "Paciente Removido"}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-fg">
                                                            <span className="flex items-center gap-1">
                                                                {app.type === "ONLINE" ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <MapPin className="w-3.5 h-3.5 text-warm" />}
                                                                {app.type === "ONLINE" ? "Online" : "Presencial"}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-border" />
                                                            <span>{app.patient?.phone || ""}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t border-border/40 sm:border-0 mt-2 sm:mt-0">
                                                    <Link href={`/area-clinica/prontuarios/${app.patient?.id || ""}`}>
                                                        <button className="px-4 py-2 bg-surface/85 hover:bg-surface border border-border/80 text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-primary" />
                                                            Prontuário
                                                        </button>
                                                    </Link>

                                                    {(!isCompleted && !isAbsent && !isCancelled) && (
                                                        <>
                                                            <CompleteAppointmentButton appointmentId={app.id} />
                                                            <AbsentButton appointmentId={app.id} />
                                                            <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} isProfessional={true} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column - Alerts & Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        Atenção Necessária
                    </h2>

                    {absentAppointments.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {absentAppointments.map(app => (
                                <div key={app.id} className="bg-rose-400/5 border border-rose-400/20 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{app.patient?.name || "Paciente Removido"} faltou.</p>
                                        <p className="text-xs text-muted-fg mt-0.5">Sessão de {format(app.startTime, "HH:mm")}</p>
                                    </div>
                                    <NotifyAbsentButton phone={app.patient?.phone || ""} patientName={app.patient?.name || "Paciente"} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-surface/30 border border-border/80 rounded-2xl p-6 text-center backdrop-blur-md">
                            <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">Nenhuma pendência.</p>
                            <p className="text-xs text-muted-fg mt-0.5">Tudo sob controle hoje.</p>
                        </div>
                    )}

                    {/* Quick Add Patient or Appointment */}
                    <div className="mt-8 pt-6 border-t border-border/60">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-fg mb-4">Acesso Rápido</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/area-clinica/pacientes" className="px-4 py-3 bg-surface/40 border border-border/80 hover:border-primary/50 hover:shadow-[0_0_15px_-4px_rgba(29,184,127,0.2)] rounded-xl text-xs font-bold uppercase tracking-wider text-foreground transition-all text-center">
                                Diretório de Pacientes
                            </Link>
                            <Link href="/area-clinica/prontuarios" className="px-4 py-3 bg-surface/40 border border-border/80 hover:border-primary/50 hover:shadow-[0_0_15px_-4px_rgba(29,184,127,0.2)] rounded-xl text-xs font-bold uppercase tracking-wider text-foreground transition-all text-center">
                                Todos os Prontuários
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

