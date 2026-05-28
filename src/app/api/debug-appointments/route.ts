import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const apps = await prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: new Date("2026-05-28T00:00:00.000Z"),
                    lte: new Date("2026-05-28T23:59:59.000Z")
                }
            },
            include: {
                patient: {
                    select: { name: true, phone: true }
                }
            }
        });

        let updatedCount = 0;
        for (const app of apps) {
            if (app.startTime.toISOString() === "2026-05-28T14:30:00.000Z") {
                const newStart = new Date("2026-05-28T17:30:00.000Z");
                const newEnd = new Date("2026-05-28T18:00:00.000Z");

                await prisma.appointment.update({
                    where: { id: app.id },
                    data: {
                        startTime: newStart,
                        endTime: newEnd,
                        status: "PENDING"
                    }
                });
                updatedCount++;
                
                // Update local list for return
                app.startTime = newStart;
                app.endTime = newEnd;
            }
        }

        if (updatedCount > 0) {
            revalidatePath('/paciente/minha-agenda');
            revalidatePath('/area-clinica');
            revalidatePath('/area-clinica/agenda');
        }

        const formattedApps = apps.map(app => ({
            id: app.id,
            startTimeISO: app.startTime.toISOString(),
            endTimeISO: app.endTime.toISOString(),
            status: app.status,
            patientName: app.patient.name,
            patientPhone: app.patient.phone
        }));

        return NextResponse.json({
            status: "ok",
            count: apps.length,
            updatedCount,
            message: "Corrected any 14:30 UTC shifted appointments to 17:30 UTC (14:30 local).",
            appointments: formattedApps
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            error: err.message
        }, { status: 500 });
    }
}
