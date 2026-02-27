import prisma from "@/lib/prisma";
import { ProntuariosClient } from "@/components/ProntuariosClient";
import { PatientRegistrationDialog } from "@/components/PatientRegistrationDialog";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";
import { startOfMonth, endOfMonth } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProntuariosIndex() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Buscar todos os pacientes com contagem de consultas
    const patientsRaw = await prisma.patient.findMany({
        include: {
            _count: {
                select: { appointments: true }
            },
            appointments: {
                orderBy: { startTime: 'desc' },
                // Buscaremos as últimas consultas para determinar qual é passada e qual é futura no mapeamento
                take: 5
            }
        }
    });

    // Buscar IDs de pacientes com consulta no mês atual
    const monthApps = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: monthStart,
                lte: monthEnd
            },
            status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.COMPLETED] }
        },
        select: { patientId: true }
    });

    const monthlyPatientIds = new Set(monthApps.map(a => a.patientId));

    // Mapear dados para o formato do client
    const patients = patientsRaw.map(p => {
        const sortedApps = [...p.appointments].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const nextApp = sortedApps.find(a => new Date(a.startTime) >= now);
        const pastApps = sortedApps.filter(a => new Date(a.startTime) < now);
        const lastApp = pastApps.length > 0 ? pastApps[pastApps.length - 1] : null;

        return {
            id: p.id,
            name: p.name,
            phone: p.phone,
            createdAt: p.createdAt,
            _count: p._count,
            hasAppointmentThisMonth: monthlyPatientIds.has(p.id),
            lastAppointmentDate: lastApp ? lastApp.startTime : null,
            nextAppointmentDate: nextApp ? nextApp.startTime : null
        };
    });

    // Ordenar por nome por padrão, mas o client vai filtrar
    patients.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-light text-stone-900 tracking-tight">
                        Histórico <span className="italic font-serif text-stone-500">Clínico</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                        Repositório Permanente de Prontuários e Evoluções
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <PatientRegistrationDialog />
                    <ManualBookingDialog patients={patients.map(p => ({ id: p.id, name: p.name, phone: p.phone }))} />
                </div>
            </header>

            <ProntuariosClient initialPatients={patients} />
        </div>
    );
}
