"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trees as Tree, Calendar, Info, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled ? "glass py-3" : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Tree className="text-primary w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Equilíbrio
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#sobre" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Sobre
                    </Link>
                    <Link href="#servicos" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Serviços
                    </Link>
                    <Link href="#faq" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Dúvidas
                    </Link>
                    <Link href="#contato" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                        Contato
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                            <User className="w-4 h-4" />
                            Área Clínica
                        </Button>
                    </Link>
                    <Link href="/agendar">
                        <Button className="shadow-lg shadow-primary/20 gap-2">
                            <Calendar className="w-4 h-4" />
                            Agendar Consulta
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
