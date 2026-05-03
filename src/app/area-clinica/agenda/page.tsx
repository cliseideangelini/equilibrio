import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Download,
    Printer,
    Calendar as CalendarIcon,
    LayoutGrid,
    List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgendaClient } from "@/components/AgendaClient";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";
import { MonthlyCalendarClient } from "@/components/MonthlyCalendarClient";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ date?: string; view?: "day" | "month" }>;
}

export default async function ClinicianAgenda({ searchParams }: PageProps) {
    const params = await searchParams;
    const selectedDate = params.date ? parseISO(params.date) : new Date();
    const view = params.view || "day";

    // Buscar agendamentos do mês inteiro para o calendário mensal
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const allAppointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: monthStart,
                lte: monthEnd,
            },
            deletedAt: null
        },
        include: {
            patient: {
                select: { id: true, name: true }
            },
        },
        orderBy: { startTime: 'asc' }
    });

    // Agendamentos específicos do dia para o AgendaClient
    const dayAppointments = allAppointments.filter(app => 
        format(app.startTime, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    ).map(app => ({
        ...app,
        patient: { ...app.patient, phone: "" } // AgendaClient expected phone in previous views, adding mock or fetching if needed
    }));

    // Buscar todos os pacientes para o diálogo de agendamento manual
    const patients = await prisma.patient.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, phone: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight leading-tight">
                        Agenda <span className="italic font-serif text-stone-500">{view === 'day' ? 'do Dia' : 'Mensal'}</span>
                    </h2>
                    <p className="text-stone-400 font-medium text-sm mt-1 flex items-center gap-2">
                        {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        {view === 'day' ? `${dayAppointments.length} Sessões Hoje` : `${allAppointments.length} Sessões no Mês`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="bg-stone-100 p-1 rounded-2xl flex gap-1 mr-4">
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
                    </div>
                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl bg-white border-stone-100 text-stone-500 hover:text-stone-900 transition-all font-bold text-[10px] uppercase tracking-widest gap-2">
                        <Download size={14} /> Exportar
                    </Button>
                    <ManualBookingDialog patients={patients} />
                </div>
            </header>

            {view === 'day' ? (
                <AgendaClient initialAppointments={dayAppointments as any} initialDate={selectedDate} />
            ) : (
                <MonthlyCalendarClient initialAppointments={allAppointments as any} />
            )}

            {/* Footer status bar */}
            <div className="px-8 py-4 bg-stone-50/50 rounded-[2rem] border border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sincronizado</span>
                    <span className="flex items-center gap-2">{appointments.length} Registros na visualização atual</span>
                </div>
                <div>
                    Última Atualização: {format(new Date(), 'HH:mm:ss')}
                </div>
            </div>
        </div>
    );
}
