import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AreaClinicaDashboard() {
    const today = new Date();

    const todayAppointments = await prisma.appointment.findMany({
        where: {
            startTime: { gte: startOfDay(today), lte: endOfDay(today) },
            status: { not: "CANCELLED" },
        },
        include: { patient: true, payment: true },
        orderBy: { startTime: "asc" },
    });

    const pendingCount = await prisma.appointment.count({ where: { status: "PENDING" } });
    const totalPatients = await prisma.patient.count();
    const confirmedToday = todayAppointments.filter(a => a.status === "CONFIRMED").length;

    const stats = [
        { label: "Sessões Hoje", value: todayAppointments.length },
        { label: "Confirmadas", value: confirmedToday },
        { label: "Aguardando confirm.", value: pendingCount },
        { label: "Total Pacientes", value: totalPatients },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* 4 stat cards — small and clean */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-lg p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
                        <p className="text-2xl font-light text-stone-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Excel-style grid */}
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                {/* Grid header */}
                <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                        Agenda de Hoje — {format(today, "EEEE, dd/MM", { locale: ptBR })}
                    </p>
                    <Link href="/area-clinica/agenda" className="text-[10px] font-bold text-stone-400 hover:text-stone-700 uppercase tracking-widest underline underline-offset-4">
                        Ver completo →
                    </Link>
                </div>

                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/50">
                            <th className="text-left py-2 px-4 font-bold text-stone-400 w-24">Horário</th>
                            <th className="text-left py-2 px-4 font-bold text-stone-400">Paciente</th>
                            <th className="text-left py-2 px-4 font-bold text-stone-400 w-28">Modalidade</th>
                            <th className="text-left py-2 px-4 font-bold text-stone-400 w-28">Status</th>
                            <th className="text-left py-2 px-4 font-bold text-stone-400 w-24">Pagamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todayAppointments.length > 0 ? todayAppointments.map((app, i) => (
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
                                    {app.patient.name}
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className="inline-flex items-center gap-1.5 text-stone-500">
                                        {app.type === "ONLINE"
                                            ? <Video size={10} className="text-blue-400" />
                                            : <MapPin size={10} className="text-stone-400" />}
                                        {app.type === "ONLINE" ? "Online" : "Presencial"}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                        app.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" :
                                            app.status === "CANCELLED" ? "bg-red-50 text-red-600" :
                                                "bg-amber-50 text-amber-600"
                                    )}>
                                        {app.status === "CONFIRMED" ? "Confirmado" :
                                            app.status === "CANCELLED" ? "Cancelado" : "Pendente"}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                        app.payment?.status === "PAID"
                                            ? "bg-stone-100 text-stone-600"
                                            : "text-stone-300"
                                    )}>
                                        {app.payment?.status === "PAID" ? "Pago" : "—"}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-stone-300 italic">
                                    Sem agendamentos para hoje.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Footer bar */}
                <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center justify-between">
                    <span>{todayAppointments.length} registros</span>
                    <span>Atualizado: {format(new Date(), "HH:mm")}</span>
                </div>
            </div>
        </div>
    );
}
