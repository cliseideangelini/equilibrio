import prisma from "@/lib/prisma";
import { PatientsClient } from "@/components/PatientsClient";
import { PatientRegistrationDialog } from "@/components/PatientRegistrationDialog";
import { startOfWeek, endOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PatientsList() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Buscar todos os pacientes com contagem de consultas e suas consultas
    const patientsRaw = await prisma.patient.findMany({
        include: {
            _count: {
                select: { appointments: true }
            },
            appointments: {
                where: {
                    status: { in: ['CONFIRMED', 'PENDING'] },
                    startTime: { gte: now }
                },
                orderBy: { startTime: 'asc' },
                take: 1
            }
        }
    });

    // Precisamos de uma query separada para a flag de semanal ou processar em JS
    // Vamos processar em JS para economizar queries, buscando apenas as IDs de quem tem consulta essa semana
    const semanalApps = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: weekStart,
                lte: weekEnd
            },
            status: { in: ['CONFIRMED', 'PENDING'] }
        },
        select: { patientId: true }
    });

    const weeklyPatientIds = new Set(semanalApps.map(a => a.patientId));

    // Mapear e preparar para ordenação
    const patients = patientsRaw.map(p => {
        const nextApp = p.appointments[0];
        return {
            id: p.id,
            name: p.name,
            phone: p.phone,
            createdAt: p.createdAt,
            _count: p._count,
            hasAppointmentThisWeek: weeklyPatientIds.has(p.id),
            nextAppointmentDate: nextApp ? nextApp.startTime : null
        };
    });

    // Ordenar: Próxima consulta (mais próxima para mais longe), depois sem consulta
    patients.sort((a, b) => {
        if (a.nextAppointmentDate && b.nextAppointmentDate) {
            return a.nextAppointmentDate.getTime() - b.nextAppointmentDate.getTime();
        }
        if (a.nextAppointmentDate) return -1;
        if (b.nextAppointmentDate) return 1;
        return a.name.localeCompare(b.name);
    });

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

                <PatientRegistrationDialog />
            </header>

            <PatientsClient initialPatients={patients} />
        </div>
    );
}
