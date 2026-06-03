"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogOut, User, Sparkles } from "lucide-react";
import { logout } from "@/lib/actions";

export default function AreaClinicaLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const nav = [
        { label: "Hoje", href: "/area-clinica" },
        { label: "Agenda", href: "/area-clinica/agenda" },
        { label: "Pacientes", href: "/area-clinica/pacientes" },
        { label: "Prontuários", href: "/area-clinica/prontuarios" },
        { label: "Lista de Espera", href: "/area-clinica/lista-espera" },
        { label: "Configurações", href: "/area-clinica/configuracoes" },
    ];

    return (
        <div className="min-h-screen bg-[#050507] text-foreground font-sans flex flex-col relative overflow-x-hidden">
            {/* Ambient Background Glows - Fixed to decouple from scroll repaint */}
            <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="orb w-[500px] h-[500px] bg-primary/8 -top-40 -left-20 animate-orb" />
                <div className="orb w-[400px] h-[400px] bg-warm/5 bottom-0 right-0 animate-orb-slow" />
            </div>

            {/* Subtle grid overlay */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(hsl(var(--foreground)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.5) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                }}
            />

            {/* Top bar — refined, glassmorphic and premium */}
            <header className="bg-surface/65 backdrop-blur-xl border-b border-border/60 px-8 h-20 flex items-center justify-between shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-12">
                    <Link href="/area-clinica" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="Equilíbrio Logo"
                            width={42}
                            height={42}
                            className="group-hover:rotate-6 transition-transform duration-500 object-contain brightness-110"
                        />
                        <span className="font-serif font-bold text-xl tracking-tight hidden md:inline text-gradient">Equilíbrio</span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        {nav.map(item => {
                            const isActive = pathname === item.href || (item.href !== "/area-clinica" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)]"
                                            : "text-muted-fg hover:text-foreground hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface/50 rounded-2xl border border-border/80 backdrop-blur-md">
                        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-fg leading-none mb-0.5">Profissional</span>
                            <span className="text-sm font-bold text-foreground leading-none">Cliseide S. Angelini</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = "/login";
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-muted-fg hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all rounded-xl group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Sair</span>
                    </button>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-8 relative z-10">
                <div className="max-w-none px-2 md:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}

