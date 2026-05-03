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
        <div className="min-h-screen bg-[#FDFCFB]">
            <PatientProfileClient patient={patient} />
        </div>
    );
}
