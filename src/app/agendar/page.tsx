import BookingForm from "@/components/BookingForm";
import { ArrowLeft, Flower2 } from "lucide-react";
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
                        <h2 className="text-sm font-semibold tracking-tight text-stone-800">Equilíbrio</h2>
                    </div>

                    <div className="w-10" /> {/* Balance spacer */}
                </div>
            </header>

            <main className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section - Serene and Welcoming */}
                    <div className="text-center mb-20 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-widest">
                            <Flower2 size={12} className="text-stone-400" />
                            Seu momento de cuidado
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900">
                            Reserve um tempo <br />
                            <span className="italic font-serif text-stone-500">para você.</span>
                        </h1>
                        <p className="text-stone-400 font-medium text-sm md:text-base max-w-sm mx-auto leading-relaxed">
                            O primeiro passo para o equilíbrio é dar espaço ao que você sente.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden">
                         <BookingForm />
                    </div>

                    {/* Footer Credits */}
                    <footer className="mt-20 text-center space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300">
                            Equilíbrio Psicologia • 2024
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
