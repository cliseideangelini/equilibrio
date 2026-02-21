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
        <div className="container mx-auto px-6 pt-32 pb-20">
            <AdminNavBar />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-sage-600 text-white border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Sessões hoje</CardTitle>
                        <Clock className="w-4 h-4 text-sage-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{todayAppointments.length}</div>
                        <p className="text-xs text-sage-200 mt-1 italic">Próxima às 14:00</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando Confirmação</CardTitle>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingAppointments}</div>
                        <p className="text-xs text-muted-foreground mt-1">Clique para revisar</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
                        <Users className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground mt-1">+3 este mês</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-10">
                {/* Lista de hoje */}
                <section>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Agenda de Hoje
                    </h3>

                    <div className="space-y-4">
                        {todayAppointments.length > 0 ? todayAppointments.map((app: any) => (
                            <div key={app.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border hover:shadow-md transition-shadow group">
                                <div className="w-16 h-16 bg-sage-50 rounded-xl flex flex-col items-center justify-center border border-sage-100 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="text-xs font-medium uppercase">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-xl font-bold">{format(app.startTime, 'HH:mm')}</span>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">{app.patient.name}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            app.status === 'PENDING' ? "bg-yellow-500" : "bg-green-500"
                                        )} />
                                        {app.status === 'PENDING' ? 'Pendente' : 'Confirmado'} • Psicoterapia (50min)
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-sage-50/30">
                                <p className="text-muted-foreground italic">Nenhum agendamento para hoje.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Notificações e Atividades */}
                <section>
                    <h3 className="text-xl font-bold mb-6">Atividades Recentes</h3>
                    <Card className="rounded-3xl">
                        <CardContent className="p-6 space-y-6">
                            {[
                                { type: 'new', msg: 'Novo agendamento: Ricardo Santos', time: 'Há 10 min' },
                                { type: 'cancel', msg: 'Ana Paula cancelou a sessão de amanhã', time: 'Há 2 horas' },
                                { type: 'confirm', msg: 'Mensagem de confirmação enviada para João', time: 'Há 1 dia' }
                            ].map((activity: any, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mt-2 shrink-0",
                                        activity.type === 'new' ? "bg-primary" : activity.type === 'cancel' ? "bg-red-400" : "bg-sage-400"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium">{activity.msg}</p>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
