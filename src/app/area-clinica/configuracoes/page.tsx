import prisma from "@/lib/prisma";
import { updatePsychologistProfile } from "@/lib/actions";
import { Sparkles, Phone, User, Mail, Award, Check } from "lucide-react";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const psychologist = await prisma.psychologist.findFirst();

    if (!psychologist) {
        return (
            <div className="w-full max-w-xl mx-auto mt-12 p-8 bg-surface/40 border border-rose-500/20 rounded-3xl text-center backdrop-blur-md">
                <p className="text-rose-400 font-bold">Psicóloga não encontrada no sistema.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)] w-fit">
                    <Sparkles className="w-3 h-3" /> Sistema
                </span>
                <h1 className="text-4xl font-serif font-bold text-foreground">
                    Configurações
                </h1>
                <p className="text-muted-fg text-sm">
                    Atualize seus dados profissionais e configure o número de WhatsApp que receberá as notificações de agendamentos e cancelamentos.
                </p>
            </header>

            {/* Form */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden shadow-dim bg-surface/30 backdrop-blur-xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                
                <SettingsForm psychologist={{
                    name: psychologist.name,
                    email: psychologist.email,
                    crp: psychologist.crp,
                    phone: psychologist.phone || "",
                    whatsappNotifications: psychologist.whatsappNotifications,
                    whatsappNumber: psychologist.whatsappNumber || "",
                    whatsappApiKey: psychologist.whatsappApiKey || ""
                }} />
            </div>
        </div>
    );
}
