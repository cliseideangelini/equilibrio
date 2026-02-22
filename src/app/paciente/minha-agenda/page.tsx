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
    const futureAppointments = patient.appointments.filter((app: any) => new Date(app.startTime) > now && app.status !== 'CANCELLED');
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

                <div className="mt-8 pt-8 border-t border-sage-200">
                    <nav className="space-y-2 mb-8">
                        <Link href="/agendar" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-primary hover:bg-white transition-all">
                                <Calendar size={20} />
                                Novo Agendamento
                            </Button>
                        </Link>
                        <a href="https://wa.me/5519988275290" target="_blank" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:text-green-600 hover:bg-white transition-all">
                                <MessageCircle size={20} />
                                Falar com a Dra.
                            </Button>
                        </a>
                    </nav>

                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-50 transition-all font-bold">
                            <LogOut size={20} />
                            Sair do Portal
                        </Button>
                    </Link>
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

                        <div className="grid lg:grid-cols-[1fr_380px] gap-16">
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

                                    <div className="space-y-8">
                                        {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                            <div key={app.id} className="relative group perspective-1000">
                                                <div className="bg-white rounded-[3.5rem] border-2 border-primary/5 shadow-sm p-12 flex flex-col md:flex-row items-center gap-12 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10">
                                                    {/* Data Gigante */}
                                                    <div className="flex flex-col items-center justify-center shrink-0">
                                                        <div className="w-32 h-32 bg-primary text-white rounded-[3rem] flex flex-col items-center justify-center shadow-2xl shadow-primary/20 transform group-hover:-rotate-3 transition-transform duration-500">
                                                            <span className="text-sm font-black uppercase opacity-60 mb-1">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                            <span className="text-6xl font-black leading-none">{format(app.startTime, 'dd')}</span>
                                                        </div>
                                                        <span className="mt-4 font-black text-primary/40 text-xs italic tracking-widest">{format(app.startTime, 'EEEE', { locale: ptBR })}</span>
                                                    </div>

                                                    <div className="flex-1 text-center md:text-left">
                                                        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-5">
                                                            <h4 className="text-5xl font-black text-foreground tracking-tighter">
                                                                {format(app.startTime, 'HH:mm')}
                                                            </h4>
                                                            <div className="flex items-center gap-2 px-5 py-2.5 bg-sage-50 text-primary rounded-full w-fit mx-auto md:mx-0 border border-primary/10">
                                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Atendimento {app.type}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-muted-foreground/80 font-semibold text-lg flex items-center justify-center md:justify-start gap-4">
                                                            {app.type === 'ONLINE' ? <Video size={20} className="text-blue-500" /> : <MapPin size={20} className="text-sage-600" />}
                                                            {app.type === 'ONLINE' ? 'Google Meet (Link Privativo)' : 'Presencial (Unidade Equilíbrio)'}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-4 w-full md:w-auto min-w-[220px]">
                                                        {app.type === 'ONLINE' && (
                                                            <Button asChild size="lg" className="rounded-2xl h-16 font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 uppercase tracking-widest text-xs">
                                                                <a href={app.meetLink || '#'} target="_blank">Entrar na Sessão</a>
                                                            </Button>
                                                        )}
                                                        <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-32 text-center border-4 border-dashed border-primary/5 rounded-[4rem] bg-sage-50/20">
                                                <Calendar className="w-20 h-20 text-primary/10 mx-auto mb-8" />
                                                <p className="text-muted-foreground font-black italic text-3xl mb-10 max-w-sm mx-auto">Você ainda não tem novas consultas agendadas.</p>
                                                <Link href="/agendar">
                                                    <Button size="lg" className="rounded-3xl font-black px-16 h-16 uppercase tracking-widest text-xs bg-primary hover:scale-105 transition-transform shadow-xl">Agendar Agora</Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Interna dE apoio */}
                            <div className="space-y-12">
                                <div className="bg-sage-900 text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-white/10" />

                                    <div className="relative z-10 text-center">
                                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md mb-8 mx-auto">
                                            <MessageCircle size={36} />
                                        </div>
                                        <h4 className="font-black text-3xl mb-4 tracking-tight">Dra. Cliseide</h4>
                                        <p className="text-sage-200/60 font-medium text-sm mb-10 leading-relaxed">
                                            Ficou com alguma dúvida sobre o atendimento? O contato direto é feito pelo WhatsApp.
                                        </p>
                                        <a
                                            href="https://wa.me/5519988275290"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-3 bg-white text-sage-900 h-16 rounded-[1.5rem] font-black hover:bg-sage-50 transition-all shadow-xl active:scale-95"
                                        >
                                            <span className="text-xl">💬</span> Falar agora
                                        </a>
                                    </div>
                                </div>

                                {/* Última Sessão (Resumo Pequeno) */}
                                {lastPastAppointment && (
                                    <div className="p-10 bg-sage-50/50 rounded-[3.5rem] border border-primary/5">
                                        <h5 className="font-black uppercase tracking-widest text-muted-foreground/30 text-[10px] mb-6 flex items-center gap-2">
                                            <BellRing size={12} /> Última Atividade
                                        </h5>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm text-primary">
                                                <span className="text-[10px] font-black uppercase opacity-40 leading-none">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                                <span className="text-2xl font-black">{format(lastPastAppointment.startTime, 'dd')}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-foreground/70">{format(lastPastAppointment.startTime, 'HH:mm')}</p>
                                                <p className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block",
                                                    lastPastAppointment.status === 'CANCELLED' ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
                                                )}>
                                                    {lastPastAppointment.status === 'CANCELLED' ? 'Cancelada' : 'Realizada'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
