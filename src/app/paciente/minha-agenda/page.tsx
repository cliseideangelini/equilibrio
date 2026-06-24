import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { NextAppointmentWidget } from "./NextAppointmentWidget";
import { 
    QuickActionsWidget, 
    FixedTimeWidget, 
    PolicyWidget, 
    HistoryTimelineWidget 
} from "./ActionWidgets";

export const dynamic = "force-dynamic";

export default async function PatientDashboardBento() {
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
    
    // Injetar mock data para validação do layout caso o paciente não tenha consultas
    if (!patient.appointments || patient.appointments.length === 0) {
        patient.appointments = [
            {
                id: "mock1",
                patientId: patient.id,
                startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                type: "ONLINE",
                status: "SCHEDULED",
                meetLink: "https://meet.google.com/abc-defg-hij",
                payment: { status: "PENDING", value: 150 }
            },
            {
                id: "mock2",
                patientId: patient.id,
                startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                type: "PRESENCIAL",
                status: "COMPLETED",
                payment: { status: "PAID", value: 150 }
            },
            {
                id: "mock3",
                patientId: patient.id,
                startTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                type: "ONLINE",
                status: "CANCELLED",
                payment: null
            }
        ];
    }

    // Sort future appointments ascending so the [0] is the closest one
    const futureAppointments = patient.appointments
        .filter((app: any) => new Date(app.startTime) > now && app.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Past appointments descending
    const pastOrCancelled = patient.appointments.filter((app: any) => new Date(app.startTime) <= now || app.status === 'CANCELLED');

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
        <div className="min-h-screen bg-[#0A0A0A] text-foreground font-sans relative overflow-x-hidden">
            
            {/* Cinematic Aurora Background - Deep 2026 Style */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emeraldGlow-500/10 blur-[130px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-champagne-500/5 blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Navbar Minimalista */}
            <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 transition-colors shadow-dim">
                            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain shrink-0 invert opacity-90" />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl text-foreground leading-none tracking-wide">Equilíbrio</h2>
                            <p className="text-[9px] uppercase font-bold tracking-widest text-primary mt-1">Portal do Paciente</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-sm font-bold text-white">{patient.name}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logado</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            {/* Main Bento Grid Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
                
                {/* Greeting Section with Policy Widget */}
                <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight mb-4">
                            {saudacao}, <span className="text-primary italic">{patient.name.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg max-w-xl">
                            Acompanhe suas sessões, gerencie seu agendamento e tenha controle total sobre seu bem-estar, tudo em um só lugar.
                        </p>
                    </div>
                    <div className="w-full lg:w-96 shrink-0">
                        <PolicyWidget />
                    </div>
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                    
                    {/* Hero Widget: Next Appointment (Span 8 on desktop) */}
                    <div className="md:col-span-8 lg:col-span-7">
                        <NextAppointmentWidget appointments={futureAppointments} />
                    </div>

                    {/* Right Column (Span 4 on desktop) */}
                    <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-6">
                        
                        {/* Quick Actions (Bento blocks inside) */}
                        <div className="flex-1">
                            <QuickActionsWidget />
                        </div>

                        {/* Fixed Time / Notice Widget */}
                        <div className="h-auto">
                            {patient.isFixed && <FixedTimeWidget patient={patient} />}
                        </div>

                    </div>

                    {/* Bottom Row */}
                    
                    {/* Timeline History Widget (Span 12) */}
                    <div className="md:col-span-12 lg:col-span-12">
                        <HistoryTimelineWidget appointments={pastOrCancelled} />
                    </div>

                </div>

                {/* Footer space */}
                <div className="h-24"></div>
            </main>
        </div>
    );
}
