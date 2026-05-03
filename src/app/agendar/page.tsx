import SimpleBookingForm from "@/components/SimpleBookingForm";
import { WaitingListDialog } from "@/components/WaitingListDialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getPsychologistAvailability } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
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
                <Link href="/" className="group inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Início</span>
                </Link>
            </div>

            <main className="flex-1 py-12 px-6 flex flex-col items-center">
                <SimpleBookingForm availabilityRules={availability} />
            </main>
        </div>
    );
}
