import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientProfileClient from "@/components/PatientProfileClient";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
    const cookieStore = await cookies();
    const patientId = cookieStore.get("patient_id")?.value;

    if (!patientId) {
        redirect("/paciente/login");
    }

    const patient = await prisma.patient.findUnique({
        where: { id: patientId }
    });

    if (!patient) {
        redirect("/paciente/login");
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-foreground font-sans relative overflow-x-hidden pt-12">
            {/* Cinematic Aurora Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emeraldGlow-500/10 blur-[130px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-champagne-500/5 blur-[100px] animate-pulse delay-700" />
            </div>

            <div className="relative z-20">
                <PatientProfileClient patient={patient} />
            </div>
        </div>
    );
}
