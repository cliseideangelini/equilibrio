import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Download,
    Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgendaClient } from "@/components/AgendaClient";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ date?: string }>;
}

export default async function ClinicianAgenda({ searchParams }: PageProps) {
    const params = await searchParams;
    const selectedDate = params.date ? parseISO(params.date) : new Date();

    // Buscar agendamentos do dia selecionado
    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(selectedDate),
                lte: endOfDay(selectedDate),
            }
        },
        include: {
            patient: true,
            payment: true
        },
        orderBy: { startTime: 'asc' }
    });

    // Buscar todos os pacientes para o diálogo de agendamento manual
    const patients = await prisma.patient.findMany({
        select: { id: true, name: true, phone: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight leading-tight">Agenda <span className="italic font-serif text-stone-500">{params.date ? 'Programada' : 'do Dia'}</span></h2>
                    <p className="text-stone-400 font-medium text-sm mt-1 flex items-center gap-2">
                        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        {appointments.length} Sessões Encontradas
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl bg-white border-stone-100 text-stone-500 hover:text-stone-900 transition-all font-bold text-[10px] uppercase tracking-widest gap-2">
                        <Download size={14} /> Exportar
                    </Button>
                    <ManualBookingDialog patients={patients} />
                </div>
            </header>

            <AgendaClient initialAppointments={appointments} initialDate={selectedDate} />

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
