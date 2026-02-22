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
    Clock,
    LayoutDashboard,
    LogOut,
    MessageCircle,
    BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CancellationButton } from "@/components/CancellationButton";
import { AppointmentHistory } from "@/components/AppointmentHistory";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    const futureAppointments = patient.appointments.filter((app: any) => new Date(app.startTime) > now && app.status !== 'CANCELLED').reverse();
    const pastOrCancelled = patient.appointments.filter((app: any) => new Date(app.startTime) <= now || app.status === 'CANCELLED');

    const lastPastAppointment = pastOrCancelled[0];
    const remainingHistory = pastOrCancelled.slice(1);

    const nowHora = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
    const currentHour = new Date(nowHora).getHours();
    let saudacao = "Bom dia";
    if (currentHour >= 12 && currentHour < 18) saudacao = "Boa tarde";
    else if (currentHour >= 18 || currentHour < 5) saudacao = "Boa noite";

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col md:flex-row overflow-hidden font-sans">

            {/* Sidebar Lateral - Desktop */}
            <aside className="w-full md:w-96 bg-sage-50 border-r border-sage-100 flex flex-col p-8 shrink-0 overflow-y-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain shrink-0" />
                    <div>
                        <h2 className="font-black text-xl text-primary leading-none">Equilíbrio</h2>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-1">Portal do Paciente</p>
                    </div>
                </div>

                {/* Histórico na Sidebar */}
                <div className="flex-1 space-y-8">
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Clock size={12} /> Histórico de Sessões
                        </h3>
                        <AppointmentHistory appointments={pastOrCancelled} isSidebar />
                    </section>
                </div>

                <div className="mt-8 pt-8 border-t border-sage-200 space-y-8">
                    {/* Última Sessão na Sidebar */}
                    {lastPastAppointment && (
                        <div className="bg-white rounded-2xl p-4 border border-sage-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                            <h5 className="font-black uppercase tracking-widest text-muted-foreground/50 text-[9px] mb-3 flex items-center gap-1.5 relative z-10">
                                <BellRing size={10} /> Última Atividade
                            </h5>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-sage-50 rounded-xl flex flex-col items-center justify-center text-primary border border-sage-100/50">
                                    <span className="text-[8px] font-black uppercase opacity-60 leading-none">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-sm font-black leading-none mt-0.5">{format(lastPastAppointment.startTime, 'dd')}</span>
                                </div>
                                <div>
                                    <p className="font-black text-xs text-foreground/80">{format(lastPastAppointment.startTime, 'HH:mm')}</p>
                                    <p className={cn(
                                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1",
                                        lastPastAppointment.status === 'CANCELLED' ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
                                    )}>
                                        {lastPastAppointment.status === 'CANCELLED' ? <XCircle size={8} /> : <CheckCircle2 size={8} />}
                                        {lastPastAppointment.status === 'CANCELLED' ? 'Cancelada' : 'Realizada'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="space-y-2">

                        <a href="https://wa.me/5519988275290" target="_blank" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-green-600 hover:bg-white transition-all">
                                <MessageCircle size={20} />
                                Falar com a Dra.
                            </Button>
                        </a>
                    </nav>

                    <LogoutButton />
                </div>
            </aside>

            {/* Conteúdo Principal Fullscreen */}
            <main className="flex-1 overflow-y-auto bg-white flex flex-col">

                {/* Banner de Aviso de Política (Verde Água) */}
                <div className="bg-primary/5 border-b border-primary/5 py-2 relative overflow-hidden shrink-0">
                    <div className="whitespace-nowrap flex animate-marquee">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="inline-flex items-center gap-6 mx-8 text-primary/60 font-black text-[10px] tracking-[0.3em] uppercase">
                                <Info size={14} />
                                Cancelamentos com menos de 3h de antecedência serão cobrados integralmente
                                <div className="w-1 h-1 rounded-full bg-primary/20" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-12 lg:p-16">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Interno Redesenhado */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-light text-foreground tracking-tight leading-tight">
                                    {saudacao}, <span className="font-semibold text-primary">{patient.name.split(' ')[0]}</span>.
                                </h1>
                                <div className="h-[2px] w-12 bg-primary/20 mt-6 mb-4" />
                                <p className="text-muted-foreground/60 font-medium text-lg leading-relaxed max-w-md italic">
                                    Como você está se sentindo hoje?
                                </p>
                            </div>
                            <div className="flex h-fit">
                                <Link href="/agendar">
                                    <Button size="lg" className="rounded-2xl h-14 px-10 font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all bg-primary text-white border-0">
                                        Novo Agendamento
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div>
                            {/* Coluna Central */}
                            <div className="space-y-20">
                                {/* Sessões Futuras */}
                                <section>
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                            <Calendar size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Suas Próximas Consultas</h3>
                                    </div>

                                    <div className="w-full overflow-x-auto bg-white border border-sage-200 rounded-[2rem] shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-sage-50/50 border-b border-sage-200/50">
                                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Data</th>
                                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Horário</th>
                                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Modalidade</th>
                                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Local / Link</th>
                                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-sage-100/50">
                                                {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                                    <tr key={app.id} className="hover:bg-sage-50/30 transition-colors group">
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex flex-col items-center justify-center text-primary font-black leading-none">
                                                                    <span className="text-[10px] uppercase opacity-70 mb-0.5">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                                    <span className="text-sm">{format(app.startTime, 'dd')}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-foreground text-sm">{format(app.startTime, 'dd/MM/yyyy')}</span>
                                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-black">{format(app.startTime, 'EEEE', { locale: ptBR })}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <span className="text-xl font-black text-foreground">{format(app.startTime, 'HH:mm')}</span>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 text-sage-700 rounded-md border border-sage-200/50">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{app.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-sm font-semibold text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                {app.type === 'ONLINE' ? <Video size={16} className="text-blue-500" /> : <MapPin size={16} className="text-sage-600" />}
                                                                {app.type === 'ONLINE' ? 'Google Meet' : 'Presencial'}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                {app.type === 'ONLINE' && (
                                                                    app.meetLink ? (
                                                                        <Button asChild size="sm" className="rounded-xl h-10 font-black bg-blue-600 hover:bg-blue-700 shadow-sm uppercase tracking-widest text-[9px] px-4">
                                                                            <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">Entrar</a>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" disabled className="rounded-xl h-10 font-black bg-sage-100 text-sage-400 shadow-none uppercase tracking-widest text-[9px] px-4 cursor-not-allowed">
                                                                            Aguardando Link
                                                                        </Button>
                                                                    )
                                                                )}
                                                                <div className="scale-75 origin-right">
                                                                    <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-32 text-center bg-sage-50/10">
                                                            <Calendar className="w-16 h-16 text-primary/10 mx-auto mb-6" />
                                                            <p className="text-muted-foreground font-black italic text-xl mb-8">Nenhuma consulta futura.</p>
                                                            <Link href="/agendar">
                                                                <Button size="lg" className="rounded-2xl font-black px-12 h-12 uppercase tracking-widest text-[10px] bg-primary shadow-lg">Agendar Agora</Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
