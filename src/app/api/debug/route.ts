import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Testa a conexão com o banco de dados
        const psychologists = await prisma.psychologist.findMany({
            select: { id: true, name: true, email: true }
        });

        const patientCount = await prisma.patient.count();
        const appointmentCount = await prisma.appointment.count();

        return NextResponse.json({
            status: "ok",
            db: "connected",
            psychologists,
            patientCount,
            appointmentCount,
            env: {
                hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
                hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
                hasGoogleRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
                hasPostgresUrl: !!process.env.POSTGRES_PRISMA_URL,
            }
        });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
