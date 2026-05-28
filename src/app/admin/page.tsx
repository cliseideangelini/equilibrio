import prisma from "@/lib/prisma";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    CalendarCheck,
    Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminNavBar } from "@/components/AdminNavBar";
import { getLocalNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const today = getLocalNow();

    // Buscar agendamentos de hoje
    const todayAppointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            }
        },
        include: { patient: true },
        orderBy: { startTime: 'asc' }
    });

    const pendingAppointments = await prisma.appointment.count({ where: { status: 'PENDING' } });
    const totalPatients = await prisma.patient.count();
    const adminName = "Administrador";

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden pb-20">
            <AdminNavBar adminName={adminName} />
            
            {/* Ambient orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/15 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-warm/10 blur-[100px] animate-pulse delay-1000" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="mb-12 animate-fade-in">
                    <h1 className="text-5xl font-serif text-white tracking-tight mb-2">Visão Geral</h1>
                    <p className="text-muted-foreground font-medium text-lg">Acompanhe seus atendimentos de forma luxuosa e imersiva.</p>
                </div>

                {/* Stats Grid - Bento Box Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-8 border-primary/30 shadow-glow hover:-translate-y-1 transition-transform duration-500 rounded-[2rem]">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Sessões hoje</h3>
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div className="mt-4">
                            <div className="text-6xl font-serif text-white">{todayAppointments.length}</div>
                        </div>
                    </div>

                    <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-500 rounded-[2rem]">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aguardando Confirmação</h3>
                            <AlertCircle className="w-5 h-5 text-warm" />
                        </div>
                        <div className="mt-4">
                            <div className="text-6xl font-serif text-white">{pendingAppointments}</div>
                        </div>
                    </div>

                    <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-500 rounded-[2rem]">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de Pacientes</h3>
                            <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="mt-4">
                            <div className="text-6xl font-serif text-white">{totalPatients}</div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    {/* Lista de hoje */}
                    <section className="glass-card p-10 rounded-[3rem]">
                        <h3 className="text-3xl font-serif mb-8 flex items-center gap-4 text-foreground">
                            <Calendar className="w-8 h-8 text-primary" />
                            Agenda de Hoje
                        </h3>

                        <div className="space-y-4">
                            {todayAppointments.length > 0 ? todayAppointments.map((app: any) => (
                                <div key={app.id} className="flex items-center gap-6 glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="w-20 h-20 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center group-hover:border-primary/30 transition-colors duration-500 shadow-inner">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                        <span className="text-2xl font-serif text-foreground">{format(app.startTime, 'HH:mm')}</span>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-bold text-xl mb-1 text-white">{app.patient.name}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                            <span className={cn(
                                                "w-2.5 h-2.5 rounded-full shadow-sm",
                                                app.status === 'PENDING' ? "bg-champagne-400" : "bg-emeraldGlow-400"
                                            )} />
                                            {app.status === 'PENDING' ? 'Pendente' : 'Confirmado'} • {app.type === 'ONLINE' ? <><Video className="w-4 h-4 inline" /> Online</> : '🏢 Presencial'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/10 hover:text-white rounded-full transition-all">
                                            <MoreVertical size={20} />
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 text-center rounded-[2.5rem] bg-surface/40 border border-dashed border-border">
                                    <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium text-lg">Nenhum agendamento para hoje.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Notificações e Atividades */}
                    <section>
                        <div className="glass-card p-10 h-full rounded-[3rem]">
                            <h3 className="text-2xl font-serif mb-8 text-foreground">Atividades Recentes</h3>
                            <div className="space-y-8">
                                {[
                                    { type: 'new', msg: 'Novo agendamento: Ricardo Santos', time: 'Há 10 min' },
                                    { type: 'cancel', msg: 'Ana Paula cancelou a sessão de amanhã', time: 'Há 2 horas' },
                                    { type: 'confirm', msg: 'Mensagem de confirmação enviada', time: 'Há 1 dia' }
                                ].map((activity: any, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm transition-transform group-hover:scale-125 duration-300",
                                            activity.type === 'new' ? "bg-primary shadow-glow" : activity.type === 'cancel' ? "bg-red-500" : "bg-warm"
                                        )} />
                                        <div>
                                            <p className="text-sm font-bold text-foreground/90">{activity.msg}</p>
                                            <span className="text-xs text-muted-foreground font-medium">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
