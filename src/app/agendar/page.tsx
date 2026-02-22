import BookingForm from "@/components/BookingForm";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-sage-50/20 pb-20">
            {/* Header Super Clean */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sage-100 px-8 h-24">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft size={20} className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Voltar</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                        <h2 className="font-black text-xl text-primary tracking-tight">Equilíbrio</h2>
                    </div>

                    <div className="w-20" /> {/* Spacer */}
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-6xl mt-16">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Sparkles size={14} className="animate-pulse" />
                        Espaço de Cuidado
                    </div>
                    <h1 className="text-5xl md:text-6xl font-light tracking-tight">Agende sua <span className="font-semibold italic">sessão</span>.</h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl mx-auto italic opacity-60">
                        Escolha o melhor momento para dedicar a você.
                    </p>
                </div>

                <BookingForm />

                <div className="mt-20 pt-10 border-t border-sage-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 px-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© 2024 Equilíbrio Psicologia</p>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privacidade</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Termos</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
