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
            <div className="min-h-screen bg-[#0A0A0A] text-foreground font-sans relative overflow-x-hidden pt-12">
            
            {/* Cinematic Aurora Background - Deep 2026 Style */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
                <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emeraldGlow-500/10 blur-[130px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-champagne-500/5 blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Início Link */}
            <div className="container mx-auto px-6 md:px-10 pt-10 relative z-20">
                <Link href="/paciente/minha-agenda" className="group inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Painel do Paciente</span>
                </Link>
            </div>

            <main className="flex-1 py-12 px-6 flex flex-col items-center relative z-20">
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
