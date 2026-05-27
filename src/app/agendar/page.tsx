import SimpleBookingForm from "@/components/SimpleBookingForm";
import { WaitingListDialog } from "@/components/WaitingListDialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPsychologistAvailability } from "@/lib/actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
    const cookieStore = await cookies();
    const patientId = cookieStore.get("patient_id")?.value;

    if (!patientId) {
        redirect("/login?redirect=/agendar");
    }

    const patient = await prisma.patient.findUnique({
        where: { id: patientId }
    });

    if (!patient) {
        redirect("/login?redirect=/agendar");
    }

    const availability = await getPsychologistAvailability();

    return (
        <div className="min-h-screen bg-[#FDFCFB] relative overflow-hidden flex flex-col pt-12">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-[#94A694]/5 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[#F2E8DF]/20 blur-[120px]" />
            </div>

            {/* Início Link */}
            <div className="container mx-auto px-10 pt-10">
                <Link href="/paciente/minha-agenda" className="group inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Painel do Paciente</span>
                </Link>
            </div>

            <main className="flex-1 py-12 px-6 flex flex-col items-center">
                <SimpleBookingForm 
                    availabilityRules={availability} 
                    patientName={patient.name} 
                    patientPhone={patient.phone} 
                    patientEmail={patient.email || undefined} 
                />
            </main>
        </div>
    );
}
