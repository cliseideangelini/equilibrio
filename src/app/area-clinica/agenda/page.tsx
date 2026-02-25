import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CancellationButton } from "@/components/CancellationButton";
import { Video, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Simple auth check – you can replace with real auth later
export const dynamic = "force-dynamic";

export default async function ClinicianAgenda() {
    // TODO: replace with real clinician auth
    const clinicianId = "clinician_placeholder";
    if (!clinicianId) redirect("/login");

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
        include: { patient: true },
        orderBy: { startTime: "asc" },
    });

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2C3E50] p-8 font-sans">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-primary">Agenda de Hoje</h1>
                <Link href="/" className="text-sm text-primary underline">
                    ← Voltar ao início
                </Link>
            </header>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse">
                    <thead className="bg-sage-50/50 border-b border-sage-200">
                        <tr>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60">
                                Data
                            </th>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60">
                                Horário
                            </th>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60">
                                Paciente
                            </th>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60">
                                Modalidade
                            </th>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60">
                                Local / Link
                            </th>
                            <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground/60 text-right">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100/30">
                        {appointments.length > 0 ? (
                            appointments.map((app) => (
                                <tr key={app.id} className="hover:bg-sage-50/30 transition-colors">
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {format(app.startTime, "dd/MM/yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="text-xs text-muted-foreground uppercase">
                                                {format(app.startTime, "EEEE", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span className="text-lg font-black text-foreground">
                                            {format(app.startTime, "HH:mm")}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {app.patient?.name ?? "-"}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 text-sage-700 rounded-md border border-sage-200/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                {app.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm font-semibold text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {app.type === "ONLINE" ? (
                                                <Video size={16} className="text-blue-500" />
                                            ) : (
                                                <MapPin size={16} className="text-sage-600" />
                                            )}
                                            {app.type === "ONLINE" ? "Google Meet" : "Presencial"}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {app.type === "ONLINE" && app.meetLink && (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <a
                                                        href={app.meetLink.startsWith("http") ? app.meetLink : `https://${app.meetLink}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Entrar
                                                    </a>
                                                </Button>
                                            )}
                                            <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-16 text-center bg-sage-50/10">
                                    <p className="text-xl font-bold text-muted-foreground">Nenhum agendamento para hoje.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
