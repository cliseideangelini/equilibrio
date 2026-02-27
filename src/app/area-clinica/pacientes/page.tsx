import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientsClient } from "@/components/PatientsClient";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";
import { startOfWeek, endOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PatientsList() {
    // Definir o intervalo da semana atual (Domingo a Sábado)
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Buscar todos os pacientes com contagem de consultas e verificar se têm consulta na semana
    const patients = await prisma.patient.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { appointments: true }
            },
            appointments: {
                where: {
                    startTime: {
                        gte: weekStart,
                        lte: weekEnd
                    }
                },
                select: { id: true }
            }
        }
    });

    // Mapear para o formato que o client precisa, adicionando flag de consulta na semana
    const patientsWithWeeklyFlag = patients.map(p => ({
        ...p,
        hasAppointmentThisWeek: p.appointments.length > 0
    }));

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight">
                        Seus <span className="italic font-serif text-stone-500">Pacientes</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                        Gestão Completa de Prontuários e Evoluções
                    </p>
                </div>

                {/* O ManualBookingDialog serve como o fluxo de 'Novo Paciente' no agendamento */}
                <ManualBookingDialog patients={patients.map(p => ({ id: p.id, name: p.name, phone: p.phone }))} />
            </header>

            <PatientsClient initialPatients={patientsWithWeeklyFlag} />
        </div>
    );
}
