"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
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

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled ? "glass py-3" : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <img
                        src="/logo.png"
                        alt="Equilíbrio Logo"
                        className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Equilíbrio
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#sobre" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Sobre
                    </Link>
                    <Link href="/#servicos" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Serviços
                    </Link>
                    <Link href="/#faq" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Dúvidas
                    </Link>
                    <Link href="/#contato" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Contato
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {isPatient ? (
                        <Link href="/paciente/minha-agenda">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-primary font-bold bg-primary/5 rounded-xl">
                                <User className="w-4 h-4" />
                                Minha Agenda
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/paciente/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-primary font-bold">
                                <User className="w-4 h-4" />
                                Portal do Paciente
                            </Button>
                        </Link>
                    )}

                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-primary transition-colors font-medium">
                            Área Clínica
                        </Button>
                    </Link>

                    <Link href="/agendar">
                        <Button className="shadow-lg shadow-primary/20 gap-2 rounded-xl">
                            <Calendar className="w-4 h-4" />
                            Agendar
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
