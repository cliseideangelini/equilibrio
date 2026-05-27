"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [isPatient, setIsPatient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            setIsPatient(document.cookie.includes("patient_id="));
        };
        checkAuth();
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        const interval = setInterval(checkAuth, 2000);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        document.cookie = "patient_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setIsPatient(false);
        router.push("/");
    };

    if (pathname === '/paciente/minha-agenda') return null;
    if (pathname.startsWith('/area-clinica')) return null;
    if (pathname === '/login') return null;


    return (
        <div className="fixed top-6 left-0 w-full z-50 px-4 sm:px-8 pointer-events-none flex justify-center transition-all duration-700">
            <header
                className={cn(
                    "pointer-events-auto flex items-center justify-between transition-all duration-700",
                    scrolled 
                        ? "glass-panel py-3 px-8 w-full max-w-5xl shadow-dark-glass-lg border-white/10 bg-black/60 backdrop-blur-2xl" 
                        : "py-4 px-4 w-full max-w-7xl rounded-full border-transparent bg-transparent"
                )}
            >
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-primary/20 transition-colors duration-500">
                        <Image
                            src="/logo.png"
                            alt="Equilíbrio Logo"
                            width={24}
                            height={24}
                            className="group-hover:scale-110 transition-transform duration-500 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] invert"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-widest uppercase text-foreground/90 group-hover:text-primary transition-colors font-serif">
                        Equilíbrio
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-10">
                    {['Sobre', 'Serviços', 'Dúvidas', 'Contato'].map((item) => (
                        <Link 
                            key={item}
                            href={`/#${item.toLowerCase().replace('ú', 'u')}`} 
                            className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-white hover:-translate-y-0.5 transition-all duration-300 relative group"
                        >
                            {item}
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {isPatient ? (
                        <Link href="/paciente/minha-agenda">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-primary hover:text-white hover:bg-primary/20 rounded-full h-11 px-5 font-bold tracking-wider text-xs transition-all uppercase">
                                <User className="w-4 h-4" />
                                Minha Agenda
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/paciente/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full h-11 px-5 font-bold tracking-wider text-xs transition-all uppercase">
                                <User className="w-4 h-4" />
                                Paciente
                            </Button>
                        </Link>
                    )}

                    <Link href="/agendar">
                        <Button className="glass-glow gap-3 rounded-full h-12 px-8 font-bold text-white hover:bg-primary/20 hover:scale-[1.02] transition-all duration-500 uppercase tracking-widest text-xs">
                            Agendar
                            <Calendar className="w-4 h-4 text-emeraldGlow-400" />
                        </Button>
                    </Link>
                </div>
            </header>
        </div>
    );
}
