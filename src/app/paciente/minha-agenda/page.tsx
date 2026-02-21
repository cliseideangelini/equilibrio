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
    MessageCircle
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

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Sidebar Lateral - Desktop */}
            <aside className="w-full md:w-80 bg-sage-50 border-r border-sage-100 flex flex-col p-8 shrink-0 overflow-y-auto md:overflow-hidden">
                <div className="flex items-center gap-4 mb-12">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain shrink-0" />
                    <div>
                        <h2 className="font-black text-xl text-primary leading-none">Equilíbrio</h2>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mt-1">Portal do Paciente</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl bg-white shadow-sm text-primary font-bold border border-primary/10">
                        <LayoutDashboard size={20} />
                        Minha Agenda
                    </Button>
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

                <div className="mt-auto pt-8 border-t border-sage-200">
                    <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-4">Próxima Consulta</p>
                        {futureAppointments[0] ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex flex-col items-center justify-center text-primary">
                                    <span className="text-[8px] font-black uppercase leading-none">{format(futureAppointments[0].startTime, 'MMM', { locale: ptBR })}</span>
                                    <span className="text-lg font-black leading-none mt-1">{format(futureAppointments[0].startTime, 'dd')}</span>
                                </div>
                                <div>
                                    <p className="font-black text-sm text-foreground/80">{format(futureAppointments[0].startTime, 'HH:mm')}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{futureAppointments[0].type}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs italic text-muted-foreground">Sem agendamentos futuros.</p>
                        )}
                    </div>

                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <LogOut size={20} />
                            Sair do Portal
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Conteúdo Principal Fullscreen */}
            <main className="flex-1 overflow-y-auto bg-white p-6 md:p-12 lg:p-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header Interno */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 mb-3 block">Dashboard de Saúde</span>
                            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none italic">
                                Olá, <span className="text-primary not-italic">{patient.name.split(' ')[0]}</span>.
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg mt-4 max-w-xl italic">
                                "Sua mente merece o mesmo cuidado que você dedica ao mundo."
                            </p>
                        </div>
                        <div className="flex h-fit">
                            <Link href="/agendar">
                                <Button size="lg" className="rounded-[2rem] h-16 px-10 font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-95">
                                    Agendar Consulta
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
                                    <div className="w-12 h-12 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner">
                                        <Calendar size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Agenda Reservada</h3>
                                </div>

                                <div className="space-y-8">
                                    {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                        <div key={app.id} className="relative group perspective-1000">
                                            <div className="bg-white rounded-[3rem] border-2 border-primary/5 shadow-sm p-10 flex flex-col md:flex-row items-center gap-10 transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10">
                                                {/* Data Gigante */}
                                                <div className="flex flex-col items-center justify-center shrink-0">
                                                    <div className="w-28 h-28 bg-primary text-white rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl shadow-primary/20 transform group-hover:rotate-3 transition-transform duration-500">
                                                        <span className="text-sm font-black uppercase opacity-60 mb-1">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                        <span className="text-5xl font-black leading-none">{format(app.startTime, 'dd')}</span>
                                                    </div>
                                                    <span className="mt-4 font-black text-primary/40 text-sm italic">{format(app.startTime, 'EEEE', { locale: ptBR })}</span>
                                                </div>

                                                <div className="flex-1 text-center md:text-left">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                                        <h4 className="text-4xl font-black text-foreground tracking-tighter">
                                                            {format(app.startTime, 'HH:mm')}
                                                        </h4>
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-sage-50 text-primary rounded-full w-fit mx-auto md:mx-0">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                            <span className="text-xs font-black uppercase tracking-widest">Sessão {app.type}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground font-semibold text-lg flex items-center justify-center md:justify-start gap-3">
                                                        {app.type === 'ONLINE' ? <Video size={18} className="text-blue-500" /> : <MapPin size={18} className="text-sage-600" />}
                                                        {app.type === 'ONLINE' ? 'Google Meet Privativo' : 'Consultório (Clínica Equilíbrio)'}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
                                                    {app.type === 'ONLINE' && (
                                                        <Button asChild size="lg" className="rounded-2xl h-14 font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 uppercase tracking-widest text-xs">
                                                            <a href={app.meetLink || '#'} target="_blank">Entrar na Sala</a>
                                                        </Button>
                                                    )}
                                                    <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-24 text-center border-4 border-dashed border-primary/5 rounded-[4rem] bg-sage-50/50">
                                            <Calendar className="w-16 h-16 text-primary/10 mx-auto mb-6" />
                                            <p className="text-muted-foreground font-black italic text-2xl mb-8">Nenhum agendamento pendente.</p>
                                            <Link href="/agendar">
                                                <Button size="lg" className="rounded-2xl font-black px-12 h-14 uppercase tracking-widest text-xs">Agendar Agora</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Última Atividade */}
                            <section>
                                <h3 className="text-xs uppercase tracking-[0.4em] font-black text-muted-foreground/30 mb-10 flex items-center gap-4">
                                    <div className="w-12 h-[1px] bg-muted-foreground/10" />
                                    Atividade Recente
                                </h3>

                                {lastPastAppointment ? (
                                    <div className="bg-sage-50/50 border border-primary/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 group">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 bg-white shadow-inner text-primary rounded-[1.5rem] flex flex-col items-center justify-center border border-primary/5">
                                                <span className="text-xs font-black uppercase leading-none opacity-40">{format(lastPastAppointment.startTime, 'MMM', { locale: ptBR })}</span>
                                                <span className="text-3xl font-black mt-1 leading-none tracking-tighter">{format(lastPastAppointment.startTime, 'dd')}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-2xl text-foreground/70 leading-tight mb-2">{format(lastPastAppointment.startTime, 'HH:mm')}</p>
                                                <div className="flex items-center gap-3">
                                                    {lastPastAppointment.status === 'CANCELLED' ? (
                                                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
                                                            <XCircle size={10} /> Cancelada
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5">
                                                            <CheckCircle2 size={10} /> Realizada
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">{lastPastAppointment.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {lastPastAppointment.payment && (
                                            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-primary/5 pt-6 md:pt-0 md:pl-10">
                                                <p className="text-[10px] font-black text-muted-foreground/40 tracking-widest mb-1 uppercase">Valor Sessão</p>
                                                <p className="text-3xl font-black text-primary/80 tracking-tighter leading-none">R$ {lastPastAppointment.payment.amount.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-30 italic font-bold">Sem histórico.</div>
                                )}

                                {remainingHistory.length > 0 && (
                                    <div className="mt-10">
                                        <AppointmentHistory appointments={remainingHistory} />
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Sidebar Interna / Informações */}
                        <div className="space-y-10">
                            <div className="bg-primary text-white rounded-[3.5rem] p-12 shadow-[0_30px_60px_-15px_rgba(82,110,99,0.3)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-white/20 duration-1000" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16 blur-2xl" />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8">
                                        <MessageCircle size={32} />
                                    </div>
                                    <h4 className="font-black text-3xl mb-6 leading-tight tracking-tight">Atendimento Direto</h4>
                                    <p className="text-primary-foreground/70 font-medium text-base mb-10 leading-relaxed">
                                        Para alterações rápidas de horário ou dúvidas sobre seu tratamento, fale diretamente com a Dra. Cliseide.
                                    </p>
                                    <a
                                        href="https://wa.me/5519988275290"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-4 bg-white text-primary h-16 rounded-[1.5rem] font-black hover:bg-sage-50 transition-all shadow-xl active:scale-95 group/btn"
                                    >
                                        <span className="text-2xl group-hover/btn:rotate-12 transition-transform">💬</span>
                                        ABRIR WHATSAPP
                                    </a>
                                </div>
                            </div>

                            <div className="p-12 bg-sage-50 rounded-[3.5rem] text-center border-2 border-primary/5">
                                <div className="w-16 h-16 bg-primary/5 text-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock size={32} />
                                </div>
                                <h5 className="font-black uppercase tracking-[0.2em] text-primary/40 text-xs mb-4">Política de Horários</h5>
                                <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed mb-6">
                                    Para manter o fluxo da clínica, pedimos que qualquer cancelamento seja feito com pelo menos <span className="text-primary">3 horas</span> de antecedência.
                                </p>
                                <div className="bg-white/60 p-5 rounded-2xl border border-primary/5">
                                    <div className="flex items-center gap-3 text-left">
                                        <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                                        <p className="text-[10px] font-black text-amber-700 uppercase leading-tight italic">
                                            Cancelamentos tardios geram cobrança integral da sessão.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-8 border-t border-sage-100 opacity-20 hover:opacity-100 transition-opacity">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">© Equilíbrio Psicologia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
