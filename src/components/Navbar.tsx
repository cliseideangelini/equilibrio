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
        <div className="fixed top-4 left-0 w-full z-50 px-4 sm:px-6 pointer-events-none flex justify-center transition-all duration-500">
            <header
                className={cn(
                    "pointer-events-auto flex items-center justify-between transition-all duration-500 border",
                    scrolled 
                        ? "glass-panel py-3 px-6 w-full max-w-5xl rounded-full shadow-glass-lg border-white/40 bg-white/70 backdrop-blur-xl" 
                        : "py-4 px-2 w-full max-w-7xl rounded-full border-transparent bg-transparent"
                )}
            >
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/logo.png"
                        alt="Equilíbrio Logo"
                        width={32}
                        height={32}
                        className="group-hover:scale-110 transition-transform duration-500 object-contain drop-shadow-sm"
                    />
                    <span className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                        Equilíbrio
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#sobre" className="text-[13px] font-semibold text-muted-foreground hover:text-primary hover:scale-105 transition-all">
                        Sobre
                    </Link>
                    <Link href="/#servicos" className="text-[13px] font-semibold text-muted-foreground hover:text-primary hover:scale-105 transition-all">
                        Serviços
                    </Link>
                    <Link href="/#faq" className="text-[13px] font-semibold text-muted-foreground hover:text-primary hover:scale-105 transition-all">
                        Dúvidas
                    </Link>
                    <Link href="/#contato" className="text-[13px] font-semibold text-muted-foreground hover:text-primary hover:scale-105 transition-all">
                        Contato
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {isPatient ? (
                        <Link href="/paciente/minha-agenda">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-primary font-bold hover:bg-primary/10 rounded-full h-10 px-4 transition-all">
                                <User className="w-4 h-4" />
                                Minha Agenda
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/paciente/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full h-10 px-4 transition-all">
                                <User className="w-4 h-4" />
                                Portal do Paciente
                            </Button>
                        </Link>
                    )}

                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="hidden lg:flex text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full h-10 px-4 transition-all font-medium">
                            Área Clínica
                        </Button>
                    </Link>

                    <Link href="/agendar">
                        <Button className="shadow-glass gap-2 rounded-full h-10 px-6 font-bold hover:scale-105 hover:shadow-glass-lg transition-all duration-300">
                            <Calendar className="w-4 h-4" />
                            Agendar
                        </Button>
                    </Link>
                </div>
            </header>
        </div>
    );
}
