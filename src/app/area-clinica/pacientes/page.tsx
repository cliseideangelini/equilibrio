import prisma from "@/lib/prisma";
import { PatientsClient } from "@/components/PatientsClient";
import { PatientRegistrationDialog } from "@/components/PatientRegistrationDialog";
import { ManualBookingDialog } from "@/components/ManualBookingDialog";
import { startOfWeek, endOfWeek } from "date-fns";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PatientsList() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Buscar todos os pacientes com contagem de consultas e suas consultas
    const patientsRaw = await prisma.patient.findMany({
        where: { deletedAt: null },
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

    // Ordenar alfabeticamente
    patients.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-10 relative z-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="w-2.5 h-2.5" /> Prontuários Clinicos
                        </span>
                    </div>
                    <h2 className="text-4xl font-light text-foreground tracking-tight">
                        Seus <span className="italic font-serif text-muted-fg">Pacientes</span>
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                        Gestão Completa de Prontuários e Evoluções
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <PatientRegistrationDialog />
                    <ManualBookingDialog patients={patients.map(p => ({ id: p.id, name: p.name, phone: p.phone }))} />
                </div>
            </header>

            <PatientsClient initialPatients={patients} />
        </div>
    );
}

