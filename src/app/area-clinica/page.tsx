import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, MapPin, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CompleteAppointmentButton } from "@/components/CompleteAppointmentButton";
import { AbsentButton } from "@/components/AbsentButton";
import { CancellationButton } from "@/components/CancellationButton";
import { NotifyAbsentButton } from "@/components/NotifyAbsentButton";

export const dynamic = "force-dynamic";

export default async function AreaClinicaDashboard() {
    const today = new Date();

    const dailyAppointments = await prisma.appointment.findMany({
        where: {
            startTime: { gte: startOfDay(today), lte: endOfDay(today) },
        },
        include: { patient: true },
        orderBy: { startTime: "asc" },
    });

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
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800">
                    {greeting}, Cliseide.
                </h1>
                <p className="text-stone-500 text-lg">
                    Hoje é {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}. Você tem <strong className="text-primary font-semibold">{dailyAppointments.length} sessões</strong> programadas.
                </p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "A Realizar", value: pendingAppointments.length, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Realizadas", value: completedAppointments.length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Ausências", value: absentAppointments.length, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "Total do Dia", value: dailyAppointments.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-stone-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{s.label}</span>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", s.bg)}>
                                <s.icon className={cn("w-4 h-4", s.color)} />
                            </div>
                        </div>
                        <p className="text-3xl font-light text-stone-800">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Timeline - Left Column (takes 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Sessões de Hoje
                        </h2>
                        <Link href="/area-clinica/agenda" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                            Ver agenda completa →
                        </Link>
                    </div>

                    {dailyAppointments.length === 0 ? (
                        <div className="bg-white border border-stone-100 rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-stone-300" />
                            </div>
                            <p className="text-lg font-medium text-stone-600">Sua agenda está livre hoje.</p>
                            <p className="text-stone-400">Aproveite o tempo para organizar seus prontuários.</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-stone-200 ml-4 space-y-8 py-4">
                            {dailyAppointments.map((app) => {
                                const isCompleted = app.status === "COMPLETED";
                                const isAbsent = app.status === "ABSENT";
                                const isCancelled = app.status === "CANCELLED";
                                const isPast = isBefore(app.startTime, today) && !isCompleted && !isAbsent;

                                return (
                                    <div key={app.id} className="relative pl-8 group">
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute -left-1.5 top-5 w-3 h-3 rounded-full border-2 border-white ring-4 ring-white",
                                            isCompleted ? "bg-emerald-400" :
                                                isAbsent || isCancelled ? "bg-stone-300" :
                                                    isPast ? "bg-amber-400 animate-pulse" :
                                                        "bg-primary"
                                        )} />

                                        {/* Card */}
                                        <div className={cn(
                                            "bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 group-hover:shadow-md",
                                            isCompleted ? "border-emerald-100/50 opacity-75" :
                                                isAbsent || isCancelled ? "border-stone-100 opacity-60" :
                                                    "border-stone-200"
                                        )}>
                                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                                
                                                {/* Time and Patient Info */}
                                                <div className="flex items-center gap-5">
                                                    <div className="text-center">
                                                        <span className="block text-2xl font-light text-stone-800 leading-none">
                                                            {format(app.startTime, "HH:mm")}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1 block">
                                                            {app.status === "COMPLETED" ? "Finalizada" : app.status === "ABSENT" ? "Falta" : app.status === "CANCELLED" ? "Cancelada" : "Agendada"}
                                                        </span>
                                                    </div>

                                                    <div className="h-10 w-px bg-stone-100 hidden sm:block" />

                                                    <div>
                                                        <h3 className="text-lg font-bold text-stone-800">
                                                            {app.patient.name}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1 text-xs font-medium text-stone-500">
                                                            <span className="flex items-center gap-1">
                                                                {app.type === "ONLINE" ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-stone-400" />}
                                                                {app.type === "ONLINE" ? "Online" : "Presencial"}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                                                            <span>{app.patient.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t border-stone-100 sm:border-0 mt-2 sm:mt-0">
                                                    <Link href={`/area-clinica/prontuarios/${app.patient.id}`}>
                                                        <button className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
                                                            <FileText className="w-4 h-4" />
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
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        Atenção Necessária
                    </h2>

                    {absentAppointments.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {absentAppointments.map(app => (
                                <div key={app.id} className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-stone-800">{app.patient.name} faltou.</p>
                                        <p className="text-xs text-stone-500 mt-0.5">Sessão de {format(app.startTime, "HH:mm")}</p>
                                    </div>
                                    <NotifyAbsentButton phone={app.patient.phone} patientName={app.patient.name} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center">
                            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-stone-600">Nenhuma pendência.</p>
                            <p className="text-xs text-stone-400">Tudo sob controle hoje.</p>
                        </div>
                    )}

                    {/* Quick Add Patient or Appointment */}
                    <div className="mt-8 pt-6 border-t border-stone-100">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Acesso Rápido</h3>
                        <div className="flex flex-col gap-2">
                            <Link href="/area-clinica/pacientes" className="px-4 py-3 bg-white border border-stone-200 hover:border-primary/50 hover:shadow-sm rounded-xl text-sm font-bold text-stone-700 transition-all text-center">
                                Diretório de Pacientes
                            </Link>
                            <Link href="/area-clinica/prontuarios" className="px-4 py-3 bg-white border border-stone-200 hover:border-primary/50 hover:shadow-sm rounded-xl text-sm font-bold text-stone-700 transition-all text-center">
                                Todos os Prontuários
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
