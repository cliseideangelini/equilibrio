import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
            appointments: formattedApps
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            error: err.message
        }, { status: 500 });
    }
}
