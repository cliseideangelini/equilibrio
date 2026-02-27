import SimpleBookingForm from "@/components/SimpleBookingForm";
import { WaitingListDialog } from "@/components/WaitingListDialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2C3E50] selection:bg-primary/10">
            {/* Header - Glass Effect and Minimalist */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-stone-100">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Início</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center p-1.5 overflow-hidden">
                            <Image src="/logo.png" alt="Logo" width={24} height={24} className="opacity-80" />
                        </div>
                    </div>
                    <div className="w-10" /> {/* Balance spacer */}
                </div>
            </header>

            <main className="pt-32 pb-24 px-6 flex flex-col items-center gap-12">
                <SimpleBookingForm />

                <div className="max-w-4xl w-full">
                    <WaitingListDialog />
                </div>
            </main>
        </div>
    );
}
