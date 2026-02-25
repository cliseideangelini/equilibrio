"use client";

import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AreaClinicaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const navItems = [
        { label: "Início", href: "/area-clinica", icon: LayoutDashboard },
        { label: "Agenda de Hoje", href: "/area-clinica/agenda", icon: Calendar },
        { label: "Pacientes", href: "/area-clinica/pacientes", icon: Users },
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* Header / Sidebar alternative */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/area-clinica" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center p-1 overflow-hidden shadow-inner">
                                <Image src="/logo.png" alt="Logo" width={24} height={24} className="opacity-80" />
                            </div>
                            <span className="font-bold text-stone-800 tracking-tight">Área Clínica</span>
                        </Link>
                    </div>

                    <nav className="flex items-center gap-1 bg-stone-100/50 p-1 rounded-xl border border-stone-200">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "gap-2 rounded-lg text-xs font-semibold px-4 h-9 transition-all",
                                            isActive
                                                ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                                                : "text-stone-500 hover:text-stone-700"
                                        )}
                                    >
                                        <item.icon size={14} />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right mr-4 border-r border-stone-200 pr-4">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">Profissional</p>
                            <p className="text-xs font-bold text-stone-700 mt-1">Dra. Cliseide Angelini</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={18} />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-12 px-6 max-w-[1400px] mx-auto">
                {children}
            </main>
        </div>
    );
}
