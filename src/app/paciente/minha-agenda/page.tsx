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
        <div className="fixed inset-0 z-40 flex flex-col md:flex-row overflow-hidden font-sans bg-background text-foreground">

            {/* Sidebar Lateral - Desktop */}
            <aside className="w-full md:w-96 glass-card border-r border-border/60 flex flex-col p-8 shrink-0 overflow-y-auto relative z-20">
                <div className="flex items-center gap-4 mb-10 group">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-emeraldGlow-500/20 transition-colors">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain shrink-0 invert opacity-90" />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl text-foreground leading-none tracking-wide">Equilíbrio</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-primary mt-1">Portal do Paciente</p>
                    </div>
                </div>

                {/* Histórico na Sidebar */}
                <div className="flex-1 space-y-8">
                    <section>
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Clock size={12} /> Histórico de Sessões
                        </h3>
                        <div className="bg-obsidian border border-white/5 p-4 rounded-3xl">
                             <AppointmentHistory appointments={pastOrCancelled} isSidebar />
                        </div>
                    </section>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-8">
                    {/* Última Sessão na Sidebar */}
                    {lastPastAppointment && (
                        <div className="glass-card rounded-3xl p-5 border border-primary/30 relative overflow-hidden group hover:border-primary/60 transition-colors">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 blur-xl" />
                            <h5 className="font-bold uppercase tracking-widest text-primary text-[9px] mb-3 flex items-center gap-1.5 relative z-10">
                                <BellRing size={12} /> Última Atividade
                            </h5>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center text-white border border-white/10 shadow-sm">
                                    <span className="text-[9px] font-bold uppercase opacity-70 leading-none">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-base font-serif leading-none mt-0.5">{format(lastPastAppointment.startTime, 'dd')}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white/90">{format(lastPastAppointment.startTime, 'HH:mm')}</p>
                                    <p className={cn(
                                        "text-[9px] font-bold uppercase px-2 py-1 rounded-md flex items-center gap-1 mt-1 border",
                                        lastPastAppointment.status === 'CANCELLED' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"
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
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-full font-bold text-muted-foreground hover:text-foreground hover:bg-surface transition-all">
                                <User size={20} />
                                Meu Perfil
                            </Button>
                        </Link>

                        <a href="https://wa.me/5519988275290" target="_blank" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-full font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                                <MessageCircle size={20} />
                                Falar com a Dra.
                            </Button>
                        </a>
                    </nav>

                    <LogoutButton />
                </div>
            </aside>

            {/* Conteúdo Principal Fullscreen */}
            <main className="flex-1 overflow-y-auto flex flex-col relative z-10">
                
                {/* Cinematic Aurora Background */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
                    <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-emeraldGlow-500/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-champagne-500/10 blur-[100px] animate-pulse delay-1000" />
                </div>

                {/* Banner de Aviso de Política */}
                <div className="bg-primary/10 border-b border-primary/20 py-2 relative overflow-hidden shrink-0 backdrop-blur-md z-20">
                    <div className="whitespace-nowrap flex animate-marquee">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="inline-flex items-center gap-6 mx-8 text-primary font-bold text-[10px] tracking-[0.3em] uppercase">
                                <Info size={14} />
                                Cancelamentos com menos de 3h de antecedência serão cobrados integralmente
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-6 md:p-12 lg:p-16 relative z-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Interno */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-16 glass-card p-10 border-border/60 hover:border-primary/30">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-serif text-foreground tracking-tight leading-tight">
                                    {saudacao}, <span className="text-primary italic">{patient.name.split(' ')[0]}</span>.
                                </h1>
                                <p className="text-muted-foreground font-medium text-lg mt-4 max-w-md">
                                    Como você está se sentindo hoje?
                                </p>
                            </div>
                            <div className="flex h-fit">
                                <Link href="/agendar">
                                    <Button size="lg" className="rounded-full h-14 px-8 font-bold text-xs tracking-widest uppercase shadow-glow hover:shadow-glow-lg hover:-translate-y-1 transition-all duration-300 bg-primary text-white border border-primary/20">
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
                                        <div className="w-12 h-12 glass-card flex items-center justify-center text-primary shadow-sm">
                                            <Calendar size={24} />
                                        </div>
                                        <h3 className="text-2xl font-serif text-foreground tracking-tight">Suas Próximas Consultas</h3>
                                    </div>

                                    <div className="w-full overflow-x-auto glass-card border-border/60 shadow-dim">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 bg-white/5">
                                                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Data</th>
                                                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Horário</th>
                                                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modalidade</th>
                                                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Local / Link</th>
                                                    <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                                    <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-surface border border-border rounded-[1rem] shadow-sm flex flex-col items-center justify-center text-foreground font-bold leading-none group-hover:border-primary/30 transition-colors">
                                                                    <span className="text-[10px] uppercase text-muted-foreground mb-0.5">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                                    <span className="text-sm font-serif">{format(app.startTime, 'dd')}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-white text-base">{format(app.startTime, 'dd/MM/yyyy')}</span>
                                                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{format(app.startTime, 'EEEE', { locale: ptBR })}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <span className="text-xl font-serif text-white">{format(app.startTime, 'HH:mm')}</span>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface/80 border border-border text-foreground rounded-full font-bold">
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                                <span className="text-[10px] uppercase tracking-widest">{app.type}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-sm font-bold text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                {app.type === 'ONLINE' ? <Video size={18} className="text-emeraldGlow-400" /> : <MapPin size={18} className="text-champagne-400" />}
                                                                {app.type === 'ONLINE' ? 'Google Meet' : 'Presencial'}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-8 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                {app.type === 'ONLINE' && (
                                                                    app.meetLink ? (
                                                                        <Button asChild size="sm" className="rounded-full h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-glow uppercase tracking-widest text-[10px] px-6 flex items-center gap-2">
                                                                            <a href={app.meetLink.startsWith('http') ? app.meetLink : `https://${app.meetLink}`} target="_blank" rel="noopener noreferrer">
                                                                                <Video size={16} className="mr-1 inline" />
                                                                                Acessar
                                                                            </a>
                                                                        </Button>
                                                                    ) : (
                                                                        <Button size="sm" disabled className="rounded-full h-11 font-bold bg-white/5 text-muted-foreground uppercase tracking-widest text-[10px] px-6 cursor-not-allowed border border-white/10">
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
                                                            <Calendar className="w-16 h-16 text-white/10 mx-auto mb-6" />
                                                            <p className="text-white font-serif text-2xl mb-2">Nenhuma consulta futura.</p>
                                                            <p className="text-muted-foreground font-medium mb-8">Sua agenda está livre no momento.</p>
                                                            <Link href="/agendar">
                                                                <Button size="lg" className="rounded-full font-bold px-10 h-14 uppercase tracking-widest text-xs bg-primary text-white shadow-glow hover:-translate-y-1 transition-all duration-300">Agendar Agora</Button>
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
