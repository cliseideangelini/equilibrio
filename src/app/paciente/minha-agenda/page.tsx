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
    BellRing,
    User
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

    const saoPauloTime = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        hour12: false,
    }).format(new Date());
    const currentHour = parseInt(saoPauloTime);
    
    let saudacao = "Olá";
    if (currentHour >= 5 && currentHour < 12) saudacao = "Bom dia";
    else if (currentHour >= 12 && currentHour < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    return (
        <div className="fixed inset-0 z-40 flex flex-col md:flex-row overflow-hidden font-sans bg-mesh-gradient">

            {/* Sidebar Lateral - Desktop */}
            <aside className="w-full md:w-96 glass border-r border-white/60 flex flex-col p-8 shrink-0 overflow-y-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain shrink-0" />
                    </div>
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

                <div className="mt-8 pt-8 border-t border-white/40 space-y-8">
                    {/* Última Sessão na Sidebar */}
                    {lastPastAppointment && (
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/60 shadow-glass-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 blur-xl" />
                            <h5 className="font-black uppercase tracking-widest text-muted-foreground text-[9px] mb-3 flex items-center gap-1.5 relative z-10">
                                <BellRing size={12} /> Última Atividade
                            </h5>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white rounded-2xl flex flex-col items-center justify-center text-primary shadow-sm">
                                    <span className="text-[9px] font-black uppercase opacity-70 leading-none">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-base font-black leading-none mt-0.5">{format(lastPastAppointment.startTime, 'dd')}</span>
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground/90">{format(lastPastAppointment.startTime, 'HH:mm')}</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 mt-1",
                                        lastPastAppointment.status === 'CANCELLED' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {lastPastAppointment.status === 'CANCELLED' ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                                        {lastPastAppointment.status === 'CANCELLED' ? 'Cancelada' : 'Realizada'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="space-y-3">
                        <Link href="/paciente/perfil">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-full font-bold text-muted-foreground hover:text-primary hover:bg-white/60 transition-all">
                                <User size={20} />
                                Meu Perfil
                            </Button>
                        </Link>

                        <a href="https://wa.me/5519988275290" target="_blank" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-full font-bold text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all">
                                <MessageCircle size={20} />
                                Falar com a Dra.
                            </Button>
                        </a>
                    </nav>

                    <LogoutButton />
                </div>
            </aside>

            {/* Conteúdo Principal Fullscreen */}
            <main className="flex-1 overflow-y-auto flex flex-col">

                {/* Banner de Aviso de Política (Verde Água) */}
                <div className="bg-primary/10 border-b border-primary/20 py-2 relative overflow-hidden shrink-0 backdrop-blur-md">
                    <div className="whitespace-nowrap flex animate-marquee">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="inline-flex items-center gap-6 mx-8 text-primary font-black text-[10px] tracking-[0.3em] uppercase">
                                <Info size={14} />
                                Cancelamentos com menos de 3h de antecedência serão cobrados integralmente
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-12 lg:p-16">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Interno Redesenhado */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16 glass-panel p-10 rounded-[3rem] border-white/60">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                                    {saudacao}, <span className="text-primary">{patient.name.split(' ')[0]}</span>.
                                </h1>
                                <p className="text-muted-foreground font-medium text-lg mt-4">
                                    Como você está se sentindo hoje?
                                </p>
                            </div>
                            <div className="flex h-fit">
                                <Link href="/agendar">
                                    <Button size="lg" className="rounded-full h-14 px-8 font-bold text-sm tracking-widest uppercase shadow-glass-lg hover:-translate-y-1 transition-transform duration-300 bg-primary text-white border border-white/20">
                                        Novo Agendamento
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div>
                            {/* Coluna Central */}
                            <div className="space-y-12">
                                {/* Sessões Futuras */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8 pl-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-white/60">
                                            <Calendar size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Suas Próximas Consultas</h3>
                                    </div>

                                    <div className="w-full overflow-x-auto glass-panel border-white/60 rounded-[2.5rem] shadow-glass">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/40 bg-white/20">
                                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/60">Data</th>
                                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/60">Horário</th>
                                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/60">Modalidade</th>
                                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/60">Local / Link</th>
                                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/60 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/40">
                                                {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                                    <tr key={app.id} className="hover:bg-white/40 transition-colors group">
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-[1rem] shadow-sm flex flex-col items-center justify-center text-primary font-black leading-none group-hover:scale-110 transition-transform">
                                                                    <span className="text-[10px] uppercase opacity-80 mb-0.5">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                                    <span className="text-sm">{format(app.startTime, 'dd')}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-foreground text-base">{format(app.startTime, 'dd/MM/yyyy')}</span>
                                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{format(app.startTime, 'EEEE', { locale: ptBR })}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <span className="text-xl font-black text-foreground">{format(app.startTime, 'HH:mm')}</span>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm text-foreground rounded-full font-bold">
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                                <span className="text-[10px] uppercase tracking-widest">{app.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-sm font-bold text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                {app.type === 'ONLINE' ? <Video size={18} className="text-blue-500" /> : <MapPin size={18} className="text-primary" />}
                                                                {app.type === 'ONLINE' ? 'Google Meet' : 'Presencial'}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                {app.type === 'ONLINE' && (
                                                                    app.meetLink ? (
                                                                        <Button asChild size="sm" className="rounded-full h-11 font-bold bg-blue-600 hover:bg-blue-700 shadow-glass-sm shadow-blue-500/20 uppercase tracking-widest text-[10px] px-6 flex items-center gap-2">
                                                                            <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">
                                                                                <Video size={16} className="mr-1 inline" />
                                                                                Acessar
                                                                            </a>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" disabled className="rounded-full h-11 font-bold bg-white/50 text-muted-foreground shadow-none uppercase tracking-widest text-[10px] px-6 cursor-not-allowed border border-white/60">
                                                                            Aguardando Link
                                                                        </Button>
                                                                    )
                                                                )}
                                                                <div className="scale-90 origin-right">
                                                                    <CancellationButton appointmentId={app.id} startTime={new Date(app.startTime).toISOString()} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-24 text-center">
                                                            <Calendar className="w-16 h-16 text-primary/30 mx-auto mb-6" />
                                                            <p className="text-foreground font-black text-xl mb-2">Nenhuma consulta futura.</p>
                                                            <p className="text-muted-foreground font-medium mb-8">Agende sua próxima sessão quando quiser.</p>
                                                            <Link href="/agendar">
                                                                <Button size="lg" className="rounded-full font-bold px-10 h-14 uppercase tracking-widest text-xs bg-primary shadow-glass-lg hover:-translate-y-1 transition-transform">Agendar Agora</Button>
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
