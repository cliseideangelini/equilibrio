"use client";

import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/area-clinica", "/login", "/paciente/minha-agenda"];

export function ConditionalShell() {
    const pathname = usePathname();
    const hide = HIDDEN_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith("/area-clinica"));

    if (hide) return null;

    return (
        <footer className="bg-sage-50 border-t py-12">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm text-muted-foreground">
                    © 2026 Equilíbrio Psicologia Clínica
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Desenvolvido com carinho para o bem-estar. (By Pedro Gabriel)
                </p>
            </div>
        </footer>
    );
}
