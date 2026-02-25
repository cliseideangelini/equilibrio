"use client";

import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users, Home, Settings, Bell, User } from "lucide-react";
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
        { label: "Painel", href: "/area-clinica", icon: LayoutDashboard },
        { label: "Agenda", href: "/area-clinica/agenda", icon: Calendar },
        { label: "Pacientes", href: "/area-clinica/pacientes", icon: Users },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-[#2C3E50] font-sans flex overflow-hidden">
            {/* Sidebar - Sleek & Minimal */}
            <aside className="w-64 bg-white border-r border-stone-100 flex flex-col shrink-0">
                <div className="p-8">
                    <Link href="/area-clinica" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center p-2 overflow-hidden shadow-sm border border-stone-100">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="opacity-90" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-stone-900 tracking-tight block leading-none">Equilíbrio</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mt-1 block">Área Clínica</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-4 h-12 rounded-2xl text-sm font-medium transition-all px-6",
                                        isActive
                                            ? "bg-stone-900 text-white shadow-lg hover:bg-stone-800"
                                            : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                                    )}
                                >
                                    <item.icon size={18} className={isActive ? "text-white" : "text-stone-300"} />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-stone-100 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 h-12 rounded-2xl text-sm font-medium text-stone-400 hover:text-stone-600 px-6"
                    >
                        <Settings size={18} className="text-stone-300" />
                        Configurações
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-4 h-12 rounded-2xl text-sm font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 px-6 transition-colors"
                    >
                        <LogOut size={18} className="text-stone-300 transition-colors group-hover:text-red-400" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative bg-[#FDFCFB]">
                {/* Top bar */}
                <header className="h-20 bg-white/40 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Bem-vinda de volta</span>
                        <h2 className="text-sm font-bold text-stone-900">Dra. Cliseide Angelini</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-stone-400 hover:bg-white hover:text-stone-900 transition-all relative border border-transparent hover:border-stone-100">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
                            <User className="text-stone-400" size={20} />
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Custom scrollbar styling
const style = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #EBE9E6;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D8D5D0;
}
`;
