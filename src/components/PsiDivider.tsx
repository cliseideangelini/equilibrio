import { cn } from "@/lib/utils";

export function PsiDivider({ className }: { className?: string }) {
  return (
    <div className={cn("w-full flex items-center justify-center py-4 sm:py-8 opacity-70", className)}>
      <div className="w-full max-w-[150px] sm:max-w-xs h-px bg-gradient-to-r from-transparent to-primary/40" />
      <span className="font-serif text-primary px-4 text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">Ψ</span>
      <div className="w-full max-w-[150px] sm:max-w-xs h-px bg-gradient-to-l from-transparent to-primary/40" />
    </div>
  );
}
