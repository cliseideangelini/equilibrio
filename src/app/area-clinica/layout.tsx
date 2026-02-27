"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

export default function AreaClinicaLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const nav = [
        { label: "Hoje", href: "/area-clinica" },
        { label: "Agenda", href: "/area-clinica/agenda" },
        { label: "Pacientes", href: "/area-clinica/pacientes" },
        { label: "Prontuários", href: "/area-clinica/prontuarios" },
        { label: "Lista de Espera", href: "/area-clinica/lista-espera" },
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
            {/* Top bar — refined and spacious */}
            <header className="bg-white border-b border-stone-200 px-8 h-20 flex items-center justify-between shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-12">
                    <Link href="/area-clinica" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="Equilíbrio Logo"
                            width={42}
                            height={42}
                            className="group-hover:rotate-6 transition-transform duration-500 object-contain"
                        />
                    </Link>

                    <nav className="flex items-center gap-2">
                        {nav.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all decoration-2 underline-offset-4",
                                    pathname === item.href
                                        ? "bg-stone-900 text-white shadow-lg shadow-stone-200"
                                        : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                            <User size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-tighter text-stone-400 leading-none mb-0.5">Profissional</span>
                            <span className="text-sm font-bold text-stone-800 leading-none">Cliseide S. Angelini</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                            router.push("/login");
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border border-transparent hover:border-red-100 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Sair</span>
                    </button>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-none px-2 md:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
