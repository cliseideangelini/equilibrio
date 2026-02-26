import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ConfirmAppointmentButton } from "@/components/ConfirmAppointmentButton";
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
        include: { patient: true, payment: true },
        orderBy: { startTime: "asc" },
    });

    // Filtro para a tabela de hoje (Somente o que ainda vai acontecer ou está em aberto)
    const todayToPerform = dailyAppointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED");

    // Filtro para a tabela de ausências de hoje
    const todayAbsents = dailyAppointments.filter(a => a.status === "ABSENT");

    const aRealizar = todayToPerform.length;
    const realizadas = dailyAppointments.filter(a => a.status === "COMPLETED").length;
    const ausentes = todayAbsents.length;
    const canceladas = dailyAppointments.filter(a => a.status === "CANCELLED").length;

    const stats = [
        { label: "Consultas a Realizar", value: aRealizar },
        { label: "Consultas Realizadas", value: realizadas },
        { label: "Consultas Ausentes", value: ausentes },
        { label: "Consultas Canceladas", value: canceladas },
    ];

    return (
        <div className="w-full space-y-10 pb-12 animate-in fade-in duration-500">

            {/* 4 stat cards — small and clean */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-lg p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
                        <p className="text-2xl font-light text-stone-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Today's Agenda Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Agenda de Hoje — {format(today, "EEEE, dd/MM", { locale: ptBR })}
                    </p>
                    <Link href="/area-clinica/agenda" className="text-[10px] font-bold text-stone-400 hover:text-stone-700 uppercase tracking-widest">
                        Ver completo →
                    </Link>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-stone-100 bg-stone-50/50">
                                <th className="text-left py-2 px-4 font-bold text-stone-400 w-24">Horário</th>
                                <th className="text-left py-2 px-4 font-bold text-stone-400">Paciente</th>
                                <th className="text-left py-2 px-4 font-bold text-stone-400 w-28">Modalidade</th>
                                <th className="text-right py-2 px-4 font-bold text-stone-400">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayToPerform.length > 0 ? todayToPerform.map((app, i) => (
                                <tr
                                    key={app.id}
                                    className={cn(
                                        "border-b border-stone-100 hover:bg-stone-50 transition-colors",
                                        i % 2 === 1 && "bg-stone-50/30"
                                    )}
                                >
                                    <td className="py-2.5 px-4 font-mono font-bold text-stone-800">
                                        {format(app.startTime, "HH:mm")}
                                    </td>
                                    <td className="py-2.5 px-4 font-medium text-stone-700">
                                        <Link
                                            href={`/area-clinica/prontuarios/${app.patient.id}`}
                                            className="hover:text-stone-900 hover:underline decoration-stone-200 underline-offset-4 transition-all"
                                        >
                                            {app.patient.name}
                                        </Link>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className="inline-flex items-center gap-1.5 text-stone-500">
                                            {app.type === "ONLINE"
                                                ? <Video size={10} className="text-blue-400" />
                                                : <MapPin size={10} className="text-stone-400" />}
                                            {app.type === "ONLINE" ? "Online" : "Presencial"}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <CompleteAppointmentButton appointmentId={app.id} />
                                            <AbsentButton appointmentId={app.id} />
                                            <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-stone-300 italic">
                                        Sem agendamentos pendentes para hoje.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Confirmation Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Ausências de Hoje
                    </p>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-stone-100 bg-stone-50/50">
                                <th className="text-left py-2 px-4 font-bold text-stone-400 w-32">Data/Hora</th>
                                <th className="text-left py-2 px-4 font-bold text-stone-400">Paciente</th>
                                <th className="text-left py-2 px-4 font-bold text-stone-400 w-28">WhatsApp</th>
                                <th className="text-right py-2 px-4 font-bold text-stone-400 w-24">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayAbsents.length > 0 ? todayAbsents.map((app, i) => (
                                <tr
                                    key={app.id}
                                    className={cn(
                                        "border-b border-stone-100 hover:bg-stone-50 transition-colors",
                                        i % 2 === 1 && "bg-stone-50/30"
                                    )}
                                >
                                    <td className="py-2.5 px-4 font-mono text-stone-800">
                                        <span className="font-bold">{format(app.startTime, "HH:mm")}</span>
                                    </td>
                                    <td className="py-2.5 px-4 font-medium text-stone-700">
                                        {app.patient.name}
                                    </td>
                                    <td className="py-2.5 px-4 text-stone-400 font-mono">
                                        {app.patient.phone}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <NotifyAbsentButton phone={app.patient.phone} patientName={app.patient.name} />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-stone-300 italic">
                                        Nenhuma ausência registrada hoje.
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
