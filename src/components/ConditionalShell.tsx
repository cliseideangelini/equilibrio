"use client";

export function ConditionalShell() {
    return (
        <footer className="w-full bg-[#050505] border-t border-white/5 py-3 px-4 z-50 relative mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold">
                <div className="flex-1 text-center md:text-left">
                    <span>© 2026 Equilíbrio Psicologia Clínica</span>
                </div>
                <div className="flex-1 text-center text-muted-foreground/40">
                    <span className="normal-case tracking-normal font-medium text-[10px]">Desenvolvido com carinho para o bem-estar. (By Pedro Gabriel)</span>
                </div>
                <div className="flex-1 text-center md:text-right">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-full text-[8px]">V2.0</span>
                </div>
            </div>
        </footer>
    );
}
