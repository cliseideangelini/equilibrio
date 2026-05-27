"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    CalendarPlus, 
    MessageCircle, 
    User, 
    CreditCard, 
    CheckCircle2, 
    AlertCircle,
    Info,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentHistory } from "@/components/AppointmentHistory";

export function QuickActionsWidget() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            <Link href="/agendar" className="glass-card flex flex-col items-center justify-center p-6 rounded-3xl border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CalendarPlus className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white text-center">Novo<br/>Agendamento</span>
            </Link>

            <a href="https://wa.me/5519988275290" target="_blank" rel="noopener noreferrer" className="glass-card flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group">
                <MessageCircle className="w-8 h-8 text-muted-foreground group-hover:text-white mb-3 group-hover:scale-110 transition-all" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white text-center">Falar com<br/>a Dra.</span>
            </a>

            <Link href="/paciente/perfil" className="glass-card flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group">
                <User className="w-8 h-8 text-muted-foreground group-hover:text-white mb-3 group-hover:scale-110 transition-all" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white text-center">Meu<br/>Perfil</span>
            </Link>
        </div>
    );
}

export function FixedTimeWidget({ patient }: { patient: any }) {
    if (!patient.isFixed || patient.fixedDayOfWeek === null || !patient.fixedTime) return null;

    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    
    return (
        <div className="glass-card rounded-[2.5rem] p-8 border border-champagne-500/30 bg-champagne-500/5 relative overflow-hidden group hover:border-champagne-500/60 transition-all">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-champagne-500/20 rounded-full blur-2xl group-hover:bg-champagne-500/30 transition-all" />
            
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-champagne-500/20 flex items-center justify-center border border-champagne-500/30 text-champagne-500 shrink-0">
                    <Sparkles size={20} />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-champagne-500 mb-1">Horário Fixo Reservado</p>
                    <p className="font-serif text-lg text-white leading-tight">
                        Toda <span className="italic text-champagne-400">{days[patient.fixedDayOfWeek]}</span> às <span className="font-sans">{patient.fixedTime}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export function FinancialWidget({ appointments }: { appointments: any[] }) {
    // Only check past appointments or today's appointments
    const now = new Date();
    const relevantAppointments = appointments.filter((app: any) => 
        new Date(app.startTime) <= now && app.status !== 'CANCELLED'
    );

    const hasPendingPayment = relevantAppointments.some((app: any) => 
        !app.payment || app.payment.status === 'PENDING'
    );

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/10 flex items-center gap-5">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                hasPendingPayment 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : "bg-emeraldGlow-500/10 text-emeraldGlow-400 border-emeraldGlow-500/20"
            )}>
                <CreditCard size={20} />
            </div>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Status Financeiro</p>
                <div className="flex items-center gap-2">
                    {hasPendingPayment ? (
                        <>
                            <AlertCircle size={14} className="text-red-400" />
                            <span className="font-bold text-sm text-white">Pagamento Pendente</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={14} className="text-emeraldGlow-400" />
                            <span className="font-bold text-sm text-white">Tudo em dia</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export function PolicyWidget() {
    return (
        <div className="glass-card rounded-3xl p-6 border border-white/5 bg-black/40">
            <div className="flex items-start gap-4">
                <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-2">Política de Cancelamento</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Cancelamentos com menos de <strong className="text-white">3h de antecedência</strong> serão cobrados integralmente. O reagendamento está sujeito à disponibilidade.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function HistoryTimelineWidget({ appointments }: { appointments: any[] }) {
    if (appointments.length === 0) {
        return (
            <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 text-center">
                <p className="text-muted-foreground text-sm font-medium">Nenhum histórico de sessões.</p>
            </div>
        );
    }

    // Limit to last 5
    const recentHistory = appointments.slice(0, 5);

    return (
        <div className="glass-card rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">
                Linha do Tempo
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {recentHistory.map((app: any, idx: number) => {
                    const isCancelled = app.status === 'CANCELLED';
                    
                    return (
                        <div key={app.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            
                            {/* Icon */}
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(255,255,255,0.05)] z-10",
                                isCancelled ? "text-red-400" : "text-primary"
                            )}>
                                {isCancelled ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                            </div>
                            
                            {/* Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                                <div className="flex flex-col mb-1">
                                    <span className="font-serif text-white text-base">
                                        {format(new Date(app.startTime), "dd 'de' MMM", { locale: ptBR })}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {format(new Date(app.startTime), "HH:mm")}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest inline-block mt-2 px-2 py-0.5 rounded-full",
                                    isCancelled ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                                )}>
                                    {isCancelled ? "Cancelada" : "Realizada"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
