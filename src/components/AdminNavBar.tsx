"use client";

import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/lib/actions";

export function AdminNavBar() {
    const router = useRouter();

    const handleLogout = async () => {
        if (window.confirm("Tem certeza que deseja sair do painel?")) {
            await logout();
            window.location.replace("/login");
        }
    };

    return (
        <div className="flex items-center justify-between mb-12 glass-panel p-6">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-foreground">Olá, Dra. Cliseide</h1>
                    <p className="text-muted-foreground font-medium text-sm mt-1">Bem-vinda de volta ao seu painel clínico.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <nav className="hidden lg:flex items-center bg-white/50 backdrop-blur-md border border-white/60 shadow-glass-sm rounded-full px-2 py-2 gap-2 mr-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="gap-2 rounded-full bg-white shadow-sm text-primary font-bold hover:bg-white/80 transition-all">
                            <LayoutDashboard size={18} />
                            Início
                        </Button>
                    </Link>
                    <Link href="/area-clinica/agenda">
                        <Button variant="ghost" size="sm" className="gap-2 rounded-full text-muted-foreground hover:text-foreground font-semibold transition-all">
                            <Calendar size={18} />
                            Agenda
                        </Button>
                    </Link>
                    <Link href="/area-clinica/pacientes">
                        <Button variant="ghost" size="sm" className="gap-2 rounded-full text-muted-foreground hover:text-foreground font-semibold transition-all">
                            <Users size={18} />
                            Pacientes
                        </Button>
                    </Link>
                </nav>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-full h-11 px-6 font-bold gap-2 hover:bg-red-50 hover:text-red-600 border-white/60 shadow-glass-sm hover:border-red-200 transition-all duration-300"
                >
                    <LogOut size={18} />
                    Sair do Sistema
                </Button>
            </div>
        </div>
    );
}
