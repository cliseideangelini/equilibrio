import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    Video,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CancellationButton } from "@/components/CancellationButton";
import { AppointmentHistory } from "@/components/AppointmentHistory";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PatientDashboard() {
    const cookieStore = await cookies();
    const patientId = cookieStore.get("patient_id")?.value;

    if (!patientId) {
        redirect("/paciente/login");
    }

    const patient: any = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            appointments: {
                orderBy: { startTime: 'desc' },
                include: { payment: true }
            }
        }
    });

    if (!patient) {
        redirect("/paciente/login");
    }

    const now = new Date();
    const futureAppointments = patient.appointments.filter((app: any) => new Date(app.startTime) > now && app.status !== 'CANCELLED');
    const pastOrCancelled = patient.appointments.filter((app: any) => new Date(app.startTime) <= now || app.status === 'CANCELLED');

    const lastPastAppointment = pastOrCancelled[0];
    const remainingHistory = pastOrCancelled.slice(1);

    return (
        <div className="min-h-screen bg-sage-50/30 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Header */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3 leading-tight">Olá, {patient.name}!</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">"Cuidar da mente é o primeiro passo para o equilíbrio."</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-12">

                    {/* Coluna Principal */}
                    <div className="space-y-16">
                        {/* Próximas Sessões */}
                        <section>
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary/60 mb-8 flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-primary/20" />
                                Próximas Consultas
                            </h3>

                            <div className="space-y-6">
                                {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                    <div key={app.id} className="bg-white rounded-[2.5rem] border-2 border-primary/5 shadow-sm overflow-hidden p-8 group transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                            {/* Data Badge */}
                                            <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex flex-col items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                                                <span className="text-xs font-black uppercase opacity-70 mb-1">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                <span className="text-4xl font-black">{format(app.startTime, 'dd')}</span>
                                            </div>

                                            {/* Detalhes */}
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                                    <h4 className="text-3xl font-black text-foreground">
                                                        {format(app.startTime, 'HH:mm')}
                                                    </h4>
                                                    <span className="text-xs font-black px-4 py-1.5 bg-sage-100 text-primary rounded-full uppercase tracking-wider w-fit mx-auto md:mx-0">
                                                        Psicoterapia {app.type === 'ONLINE' ? 'Online' : 'Presencial'}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-2">
                                                    {app.type === 'ONLINE' ? <Video size={16} /> : <MapPin size={16} />}
                                                    {app.type === 'ONLINE' ? 'Google Meet' : 'Consultório Presencial'}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[180px]">
                                                {app.type === 'ONLINE' && (
                                                    <Button asChild className="rounded-2xl h-12 font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 leading-none">
                                                        <a href={app.meetLink || '#'} target="_blank">Entrar na Sala</a>
                                                    </Button>
                                                )}
                                                <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-[3rem] bg-white/20">
                                        <p className="text-muted-foreground font-bold italic text-lg mb-4">Nenhuma consulta agendada.</p>
                                        <Link href="/agendar">
                                            <Button className="rounded-2xl font-black px-8">Agendar Agora</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Última Atividade e Histórico Oculto */}
                        <section>
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-8 flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-muted-foreground/10" />
                                Última Consulta
                            </h3>

                            {lastPastAppointment ? (
                                <div className="bg-white/40 border border-primary/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-white shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-sage-100/50 text-primary rounded-2xl flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black uppercase leading-none opacity-50">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                            <span className="text-2xl font-black">{format(lastPastAppointment.startTime, 'dd')}</span>
                                        </div>
                                        <div>
                                            <p className="font-black text-foreground/70">{format(lastPastAppointment.startTime, 'HH:mm')} • Psicoterapia</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {lastPastAppointment.status === 'CANCELLED' ? (
                                                    <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Cancelada</span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Realizada</span>
                                                )}
                                                <span className="text-[10px] font-bold text-muted-foreground/30">• {lastPastAppointment.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {lastPastAppointment.payment && (
                                        <div className="text-right">
                                            <p className="text-xs font-black text-muted-foreground/60">VALOR DA SESSÃO</p>
                                            <p className="text-lg font-black text-primary/80 leading-none">R$ {lastPastAppointment.payment.amount.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground font-medium italic py-10">Ainda não há histórico de sessões.</p>
                            )}

                            {remainingHistory.length > 0 && (
                                <AppointmentHistory appointments={remainingHistory} />
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-sage-800 text-white rounded-[3rem] p-10 shadow-2xl shadow-sage-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-white/10" />
                            <h4 className="font-black text-2xl mb-4 relative z-10">Dúvidas?</h4>
                            <p className="text-sage-200 font-medium text-sm mb-8 relative z-10 leading-relaxed">Fale no WhatsApp para dúvidas urgentes.</p>
                            <a
                                href="https://wa.me/5519988275290"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-3 bg-white text-sage-900 h-14 rounded-[1.25rem] font-black hover:bg-sage-50 transition-all relative z-10 shadow-xl active:scale-95"
                            >
                                💬 WhatsApp
                            </a>
                        </div>

                        <div className="p-8 bg-white border-2 border-primary/5 rounded-[3rem] text-center shadow-sm">
                            <Clock className="w-8 h-8 text-amber-500/30 mx-auto mb-4" />
                            <p className="text-[11px] text-muted-foreground/70 font-bold uppercase tracking-widest leading-relaxed">
                                Lembrete: Cancelamentos com menos de 3h geram cobrança.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
