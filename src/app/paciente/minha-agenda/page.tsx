import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calendar,
    Video,
    MapPin,
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CancellationButton } from "@/components/CancellationButton";
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

    const futureAppointments = patient.appointments.filter((app: any) => new Date(app.startTime) > new Date() && app.status !== 'CANCELLED');
    const pastAppointments = patient.appointments.filter((app: any) => new Date(app.startTime) <= new Date() || app.status === 'CANCELLED');

    return (
        <div className="min-h-screen bg-sage-50/30 pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Olá, {patient.name}!</h1>
                        <p className="text-muted-foreground italic text-sm">Bem-vindo(a) ao seu portal de agendamentos.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/">
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Sair para o Site
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-8">

                    {/* Coluna Principal */}
                    <div className="space-y-10">
                        {/* Próximas Sessões */}
                        <section>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Próximas Consultas
                            </h3>

                            <div className="space-y-4">
                                {futureAppointments.length > 0 ? futureAppointments.map((app: any) => (
                                    <div key={app.id} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden p-6 relative group transition-all hover:shadow-md">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Data Badge */}
                                            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex flex-col items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                                <span className="text-xs font-bold uppercase text-primary group-hover:text-white/80">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                <span className="text-2xl font-black text-primary group-hover:text-white">{format(app.startTime, 'dd')}</span>
                                            </div>

                                            {/* Detalhes */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-xl font-bold flex items-center gap-3">
                                                            {format(app.startTime, 'HH:mm')}
                                                            <span className="text-sm font-normal text-muted-foreground">• 30 min</span>
                                                        </h4>
                                                        <p className="text-muted-foreground text-sm font-medium mt-1">
                                                            Psicoterapia {app.type === 'ONLINE' ? '🎥 Online' : '🏢 Presencial'}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                        Confirmado
                                                    </span>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {app.type === 'ONLINE' ? (
                                                        <a
                                                            href={app.meetLink || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Video className="w-5 h-5" />
                                                            <div className="text-left">
                                                                <p className="text-xs font-bold uppercase">Entrar na sala</p>
                                                                <p className="text-[11px] opacity-80">Link do Google Meet</p>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href="https://maps.app.goo.gl/yYvT69W1V3Q2"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-sage-50 text-sage-800 rounded-2xl border border-sage-100 hover:bg-sage-100 transition-colors"
                                                        >
                                                            <MapPin className="w-5 h-5" />
                                                            <div className="text-left">
                                                                <p className="text-xs font-bold uppercase">Ver Endereço</p>
                                                                <p className="text-[11px] opacity-80">Abrir no Maps/Waze</p>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col justify-end gap-3 pt-2">
                                                <CancellationButton appointmentId={app.id} startTime={app.startTime.toISOString()} />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 px-6 text-center border-2 border-dashed rounded-[2rem] bg-white/50">
                                        <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                        <p className="text-muted-foreground italic">Nenhuma consulta agendada para o futuro.</p>
                                        <Link href="/agendar">
                                            <Button variant="link" className="text-primary font-bold mt-2">Agendar Nova Sessão</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Histórico */}
                        <section>
                            <h3 className="text-xl font-bold mb-6 text-muted-foreground">Histórico de Atendimentos</h3>
                            <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                                <div className="divide-y">
                                    {pastAppointments.length > 0 ? pastAppointments.map((app: any) => (
                                        <div key={app.id} className="p-5 flex items-center justify-between group transition-colors hover:bg-sage-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-sage-100 group-hover:bg-white transition-colors">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{format(app.startTime, 'MMM', { locale: ptBR })}</span>
                                                    <span className="text-lg font-bold">{format(app.startTime, 'dd')}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{format(app.startTime, 'HH:mm')} • Psicoterapia</p>
                                                    <p className="text-xs text-muted-foreground">{app.type === 'ONLINE' ? '💻 Online' : '🏢 Presencial'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-bold text-foreground">R$ 150,00</p>
                                                    <p className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider",
                                                        app.payment?.status === 'PAID' ? "text-green-600" : "text-amber-600"
                                                    )}>
                                                        {app.payment?.status === 'PAID' ? 'Pago' : app.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                                                    </p>
                                                </div>
                                                {app.status === 'CANCELLED' ? (
                                                    <XCircle className="text-red-400 w-5 h-5" />
                                                ) : (
                                                    <CheckCircle2 className="text-sage-400 w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-muted-foreground italic text-sm">Nenhum histórico encontrado.</div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border shadow-sm overflow-hidden">
                            <CardHeader className="bg-primary text-white p-6">
                                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Investido</span>
                                    <span className="font-bold">R$ 450,00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Sessões Realizadas</span>
                                    <span className="font-bold">3</span>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-sage-50 p-3 rounded-xl">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                        <p>Pagamentos devem ser realizados via PIX ou Transferência em até 24h após a sessão.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-sage-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h4 className="font-bold text-lg mb-2 relative z-10">Dúvidas?</h4>
                            <p className="text-xs text-white/80 mb-4 relative z-10">Entre em contato diretamente com a Dra. Cliseide pelo WhatsApp.</p>
                            <a
                                href="https://wa.me/5519988275290"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-sage-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-sage-50 transition-colors relative z-10"
                            >
                                Chamada Rápida
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
