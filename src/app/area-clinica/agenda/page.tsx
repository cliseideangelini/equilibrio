import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Download,
    Calendar as CalendarIcon,
    LayoutGrid,
    List,
    Settings,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgendaClient } from "@/components/AgendaClient";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";
import { MonthlyCalendarClient } from "@/components/MonthlyCalendarClient";
import { AgendaConfigClient } from "@/components/AgendaConfigClient";
import Link from "next/link";

import { getAppointmentsWithFixed } from "@/lib/actions";
import { getLocalNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ date?: string; view?: "day" | "month" | "config" }>;
}

export default async function ClinicianAgenda({ searchParams }: PageProps) {
    const params = await searchParams;
    let selectedDate = getLocalNow();
    if (params.date) {
        try {
            const parsed = parseISO(params.date);
            if (!isNaN(parsed.getTime())) {
                selectedDate = parsed;
            }
        } catch (e) {
            // fallback
        }
    }
    const view = params.view || "day";

    // Buscar agendamentos do mês inteiro para o calendário mensal
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const allAppointments = await getAppointmentsWithFixed(monthStart, monthEnd);

    // Agendamentos específicos do dia para o AgendaClient
    const dayAppointments = allAppointments.filter(app => 
        format(new Date(app.startTime), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    ).map(app => ({
        id: app.id,
        startTime: new Date(app.startTime).toISOString(),
        endTime: new Date(app.endTime).toISOString(),
        status: app.status,
        type: app.type,
        meetLink: app.meetLink,
        patient: { 
            id: app.patient?.id || "", 
            name: app.patient?.name || "Paciente Removido", 
            phone: app.patient?.phone || "" 
        },
        payment: null
    }));

    const serializedAllAppointments = allAppointments.map(app => ({
        id: app.id,
        startTime: new Date(app.startTime).toISOString(),
        endTime: new Date(app.endTime).toISOString(),
        status: app.status,
        type: app.type,
        patient: { 
            id: app.patient?.id || "", 
            name: app.patient?.name || "Paciente Removido" 
        }
    }));

    // Buscar todos os pacientes com informações de fixo/avulso
    const patients = await prisma.patient.findMany({
        where: { deletedAt: null },
        select: { 
            id: true, 
            name: true, 
            phone: true,
            isFixed: true,
            fixedDayOfWeek: true,
            fixedTime: true
        },
        orderBy: { name: 'asc' }
    });

    // Buscar as regras de disponibilidade da psicóloga
    const psychologist = await prisma.psychologist.findFirst();
    const availabilities = psychologist 
        ? await prisma.availability.findMany({
            where: { psychologistId: psychologist.id },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
          })
        : [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 relative z-10">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="w-2.5 h-2.5" /> Calendário e Horários
                        </span>
                    </div>
                    <h2 className="text-4xl font-light text-foreground tracking-tight leading-tight">
                        Agenda <span className="italic font-serif text-muted-fg">{view === 'day' ? 'do Dia' : view === 'month' ? 'Mensal' : 'Configurações'}</span>
                    </h2>
                    <p className="text-muted-fg font-medium text-xs mt-1 flex items-center gap-2">
                        {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                        {view === 'day' ? `${dayAppointments.length} Sessões Hoje` : view === 'month' ? `${allAppointments.length} Sessões no Mês` : 'Gestão de Disponibilidade'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="bg-surface/50 border border-border/80 p-1.5 rounded-2xl flex gap-1 mr-4 backdrop-blur-md">
                        <Link href={`/area-clinica/agenda?view=day&date=${params.date || ""}`}>
                            <Button variant={view === 'day' ? 'default' : 'ghost'} size="sm" className="h-9 px-4 rounded-xl font-bold text-[9px] uppercase tracking-widest gap-2">
                                <List size={14} /> Lista
                            </Button>
                        </Link>

                        <Link href={`/area-clinica/agenda?view=month&date=${params.date || ""}`}>
                            <Button variant={view === 'month' ? 'default' : 'ghost'} size="sm" className="h-9 px-4 rounded-xl font-bold text-[9px] uppercase tracking-widest gap-2">
                                <LayoutGrid size={14} /> Mês
                            </Button>
                        </Link>

                        <Link href={`/area-clinica/agenda?view=config&date=${params.date || ""}`}>
                            <Button variant={view === 'config' ? 'default' : 'ghost'} size="sm" className="h-9 px-4 rounded-xl font-bold text-[9px] uppercase tracking-widest gap-2">
                                <Settings size={14} /> Regras
                            </Button>
                        </Link>
                    </div>
                    {view !== 'config' && (
                        <>
                            <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl bg-surface/40 border-border/85 text-foreground hover:bg-surface/60 transition-all font-bold text-[10px] uppercase tracking-widest gap-2">
                                <Download size={14} className="text-primary" /> Exportar
                            </Button>
                            <ManualBookingDialog patients={patients} />
                        </>
                    )}
                </div>
            </header>

            {view === 'day' ? (
                <AgendaClient initialAppointments={dayAppointments as any} initialDate={selectedDate.toISOString()} />
            ) : view === 'month' ? (
                <MonthlyCalendarClient initialAppointments={serializedAllAppointments as any} />
            ) : (
                <AgendaConfigClient initialAvailabilities={availabilities} patients={patients} />
            )}

            {/* Footer status bar */}
            <div className="px-8 py-4 bg-surface/30 rounded-[2rem] border border-border/60 flex items-center justify-between text-[9px] text-muted-fg font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Sincronizado</span>
                    <span className="flex items-center gap-2">
                        {view === 'day' ? `${dayAppointments.length} registros` : view === 'month' ? `${allAppointments.length} registros` : 'Modo Configuração Ativo'}
                    </span>
                </div>
                <div>
                    Última Atualização: {format(getLocalNow(), 'HH:mm:ss')}
                </div>
            </div>
        </div>
    );
}
