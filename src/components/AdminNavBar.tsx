"use client";

import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export function AdminNavBar() {
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Image src="/logo.svg" alt="Logo" width={28} height={28} className="brightness-0 invert" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Olá, Dra. Cliseide</h1>
                    <p className="text-muted-foreground italic text-sm">Bem-vinda de volta ao seu painel clínico.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <nav className="hidden lg:flex items-center bg-white border rounded-2xl px-2 py-1.5 gap-1 mr-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm" className="gap-2 rounded-xl bg-sage-50 text-primary">
                            <LayoutDashboard size={16} />
                            Início
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                        <Calendar size={16} />
                        Agenda
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
                        <Users size={16} />
                        Pacientes
                    </Button>
                </nav>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-xl gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                >
                    <LogOut size={18} />
                    Sair do Sistema
                </Button>
            </div>
        </div>
    );
}
