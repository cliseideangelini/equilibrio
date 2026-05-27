import prisma from "@/lib/prisma";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminNavBar } from "@/components/AdminNavBar";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const today = new Date();

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

    // Estatísticas rápidas
    const totalAppointments = await prisma.appointment.count();
    const pendingAppointments = await prisma.appointment.count({ where: { status: 'PENDING' } });

    return (
        <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
            <AdminNavBar />

            <div className="mb-10 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                <h1 className="text-4xl font-black tracking-tight mb-2">Visão Geral</h1>
                <p className="text-muted-foreground font-medium text-lg">Acompanhe seus atendimentos de forma simples e fluida.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="glass-panel bg-primary/90 text-white border-white/20 shadow-glass-lg hover:-translate-y-1 transition-transform duration-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold opacity-90 uppercase tracking-wider">Sessões hoje</CardTitle>
                        <Clock className="w-5 h-5 text-white/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black">{todayAppointments.length}</div>
                        <p className="text-sm text-white/80 mt-2 font-medium">Próxima às 14:00</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/60 shadow-glass-sm hover:-translate-y-1 transition-transform duration-500 rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Aguardando Confirmação</CardTitle>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-foreground">{pendingAppointments}</div>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Clique para revisar</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/60 shadow-glass-sm hover:-translate-y-1 transition-transform duration-500 rounded-[2rem]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total de Pacientes</CardTitle>
                        <Users className="w-5 h-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-foreground">24</div>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">+3 este mês</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-10">
                {/* Lista de hoje */}
                <section className="glass-panel p-8 border-white/60">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        Agenda de Hoje
                    </h3>

                    <div className="space-y-4">
                        {todayAppointments.length > 0 ? todayAppointments.map((app: any) => (
                            <div key={app.id} className="flex items-center gap-6 glass p-5 rounded-3xl border-white/50 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 group">
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex flex-col items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-2xl font-black">{format(app.startTime, 'HH:mm')}</span>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-black text-xl mb-1 text-foreground">{app.patient.name}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <span className={cn(
                                            "w-2.5 h-2.5 rounded-full shadow-sm",
                                            app.status === 'PENDING' ? "bg-amber-400" : "bg-emerald-400"
                                        )} />
                                        {app.status === 'PENDING' ? 'Pendente' : 'Confirmado'} • {app.type === 'ONLINE' ? '💻 Online' : '🏢 Presencial'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-all">
                                        <MoreVertical size={20} />
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center rounded-[2.5rem] bg-white/40 border border-white/60 shadow-inner">
                                <CalendarCheck className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold text-lg">Nenhum agendamento para hoje.</p>
                                <p className="text-sm text-muted-foreground/70 font-medium">Você tem o dia livre!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Notificações e Atividades */}
                <section>
                    <div className="glass-panel p-8 border-white/60 h-full">
                        <h3 className="text-2xl font-black mb-8">Atividades Recentes</h3>
                        <div className="space-y-8">
                            {[
                                { type: 'new', msg: 'Novo agendamento: Ricardo Santos', time: 'Há 10 min' },
                                { type: 'cancel', msg: 'Ana Paula cancelou a sessão de amanhã', time: 'Há 2 horas' },
                                { type: 'confirm', msg: 'Mensagem de confirmação enviada para João', time: 'Há 1 dia' }
                            ].map((activity: any, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm transition-transform group-hover:scale-125 duration-300",
                                        activity.type === 'new' ? "bg-primary" : activity.type === 'cancel' ? "bg-red-400" : "bg-emerald-400"
                                    )} />
                                    <div>
                                        <p className="text-base font-bold text-foreground/90">{activity.msg}</p>
                                        <span className="text-xs text-muted-foreground font-medium">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
