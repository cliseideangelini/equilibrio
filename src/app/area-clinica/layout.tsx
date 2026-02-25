"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

export default function AreaClinicaLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const nav = [
        { label: "Painel", href: "/area-clinica" },
        { label: "Agenda", href: "/area-clinica/agenda" },
        { label: "Pacientes", href: "/area-clinica/pacientes" },
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
            {/* Top bar — super thin */}
            <div className="bg-white border-b border-stone-200 px-6 h-12 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-stone-800 tracking-widest uppercase">Equilíbrio · Área Clínica</span>
                    <nav className="flex items-center gap-1">
                        {nav.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 py-1 rounded text-xs font-bold transition-all",
                                    pathname === item.href
                                        ? "bg-stone-900 text-white"
                                        : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <button
                    onClick={() => {
                        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        router.push("/login");
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                >
                    <LogOut size={12} /> Sair
                </button>
            </div>

            {/* Page content */}
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
}
