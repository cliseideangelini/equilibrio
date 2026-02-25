import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    Users,
    ArrowUpRight,
    Plus,
    Clock,
    Video,
    MapPin,
    CalendarRange,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AreaClinicaDashboard() {
    const today = new Date();

    // Stats
    const todayAppointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            },
            status: { not: 'CANCELLED' }
        },
        include: { patient: true },
        orderBy: { startTime: 'asc' }
    });

    const pendingCount = await prisma.appointment.count({
        where: { status: 'PENDING' }
    });

    const totalPatients = await prisma.patient.count();

    const nextSession = todayAppointments.find(app => new Date(app.startTime) > new Date());

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 slide-in-from-bottom-5">
            {/* Minimal Welcome Context */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-light text-stone-900 tracking-tight leading-tight">
                        Seu Painel <span className="italic font-serif text-stone-500">Clínico</span>
                    </h1>
                    <p className="text-stone-400 font-medium text-sm leading-relaxed max-w-sm">
                        Um espaço sereno para gerenciar seus momentos de cuidado.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/area-clinica/agenda">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 bg-white border-stone-200 text-stone-600 gap-2 hover:bg-stone-50 transition-all font-bold text-xs uppercase tracking-widest">
                            Agenda Completa
                        </Button>
                    </Link>
                    <Button className="rounded-2xl h-12 px-8 bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-200 gap-2 font-bold text-xs uppercase tracking-widest border-0">
                        <Plus size={16} /> Novo Registro
                    </Button>
                </div>
            </div>

            {/* Aesthetic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Sessões Hoje", value: todayAppointments.length, icon: Calendar, color: "text-stone-900", bg: "bg-stone-100" },
                    { label: "Pendentes", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Total de Pacientes", value: totalPatients, icon: Users, color: "text-stone-400", bg: "bg-stone-50" },
                    { label: "Taxa de Confirm.", value: "92%", icon: Activity, color: "text-stone-400", bg: "bg-stone-50" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-stone-100/50 shadow-sm flex items-center justify-between group hover:border-stone-200 transition-all">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">{stat.label}</span>
                            <span className={cn("text-3xl font-light tracking-tight block", stat.color)}>{stat.value}</span>
                        </div>
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-10">
                {/* Proxima Sessão Featured */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                            <CalendarRange size={20} className="text-stone-300" /> Atividade do Dia
                        </h3>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{format(today, 'dd/MM/yyyy')}</span>
                    </div>

                    <div className="bg-stone-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        {/* Abstract BG Pattern */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-45">
                            <Calendar size={180} />
                        </div>

                        {nextSession ? (
                            <div className="relative z-10 space-y-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 block">Próxima Consulta: AGORA</span>
                                    <h4 className="text-4xl md:text-5xl font-light tracking-tight">{nextSession.patient.name.split(' ')[0]} <span className="italic font-serif opacity-60">{nextSession.patient.name.split(' ').slice(1).join(' ')}</span></h4>
                                </div>
                                <div className="flex flex-wrap gap-10 items-center">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase opacity-40">Horário</span>
                                        <span className="text-xl font-medium tracking-tight flex items-center gap-2">
                                            <Clock size={18} /> {format(nextSession.startTime, 'HH:mm')} - {format(nextSession.endTime, 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase opacity-40">Canal</span>
                                        <span className="text-xl font-medium tracking-tight flex items-center gap-2">
                                            {nextSession.type === 'ONLINE' ? <Video size={18} className="text-blue-400" /> : <MapPin size={18} className="text-stone-400" />}
                                            {nextSession.type === 'ONLINE' ? 'Conexão Online' : 'Consultório Presencial'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    {nextSession.type === 'ONLINE' && (
                                        <Button className="rounded-full h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 border-0 group/btn">
                                            Abrir Conferência <ArrowUpRight size={14} className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="rounded-full h-14 px-8 text-white/60 hover:text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest transition-all">Ver Detalhes</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 py-10 text-center">
                                <h4 className="text-4xl font-light tracking-tight opacity-40">Sem próximas <br /><span className="italic">consultas</span></h4>
                                <p className="mt-4 text-white/30 text-sm font-medium tracking-[0.2em] uppercase">Tudo em dia por enquanto</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumo da Lista Lateral */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-stone-900">Agenda Sequencial</h3>
                        <Link href="/area-clinica/agenda" className="text-xs font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest underline decoration-stone-200 underline-offset-8">Ver Tudo</Link>
                    </div>

                    <div className="space-y-4 max-h-[500px] pr-2 overflow-y-auto custom-scrollbar">
                        {todayAppointments.length > 0 ? todayAppointments.map((app, i) => (
                            <div key={app.id} className="group relative bg-white p-5 rounded-[2rem] border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all flex items-center gap-5">
                                <div className="w-16 h-16 bg-stone-50 rounded-[1.5rem] flex flex-col items-center justify-center border border-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-all group-hover:rotate-3">
                                    <span className="text-[10px] font-black uppercase opacity-40 leading-none mb-1 group-hover:opacity-30">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-lg font-black tracking-tight leading-none uppercase">{format(app.startTime, 'HH:mm')}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 tracking-tight group-hover:text-stone-900 transition-colors">{app.patient.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1 flex items-center gap-1.5 opacity-60">
                                        <Clock size={10} /> 50 min • {app.type}
                                    </p>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 flex scale-0 group-hover:scale-100 transition-all">
                                    <ArrowUpRight size={14} className="text-stone-900" />
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center bg-stone-50/50 rounded-[2.5rem] border-2 border-dashed border-stone-100">
                                <p className="text-stone-400 italic font-medium text-sm">Nenhuma sessão hoje.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
