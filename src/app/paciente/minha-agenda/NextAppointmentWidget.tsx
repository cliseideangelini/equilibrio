"use client";

import { useState, useEffect } from "react";
import { format, differenceInMinutes, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CancellationButton } from "@/components/CancellationButton";

export function NextAppointmentWidget({ appointments }: { appointments: any[] }) {
    const nextApp = appointments[0]; // Assumes they are sorted ascending
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!nextApp) return;

        const interval = setInterval(() => {
            const now = new Date();
            const appDate = new Date(nextApp.startTime);
            const totalMinutes = differenceInMinutes(appDate, now);
            
            if (totalMinutes > 0) {
                const days = Math.floor(totalMinutes / (24 * 60));
                const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
                const minutes = totalMinutes % 60;
                setTimeLeft({ days, hours, minutes });
            } else {
                setTimeLeft(null);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextApp]);

    if (!mounted) {
        return (
            <div className="glass-card rounded-[2.5rem] p-8 md:p-10 h-full flex flex-col justify-between border-primary/20 animate-pulse bg-white/5 min-h-[300px]">
                <div className="space-y-4">
                    <div className="w-1/3 h-3 bg-white/10 rounded" />
                    <div className="w-2/3 h-8 bg-white/10 rounded" />
                    <div className="w-1/2 h-4 bg-white/10 rounded" />
                </div>
                <div className="w-full h-12 bg-white/5 rounded-2xl mt-8" />
            </div>
        );
    }

    if (!nextApp) {
        return (
            <div className="glass-card rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center border-border/60 hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <Calendar className="w-12 h-12 text-primary/40 mb-6 relative z-10" />
                <h3 className="font-serif text-2xl text-white mb-2 relative z-10">Agenda Livre</h3>
                <p className="text-muted-foreground font-medium text-sm max-w-[200px] relative z-10">
                    Você não possui nenhuma consulta marcada no momento.
                </p>
            </div>
        );
    }

    const appDate = new Date(nextApp.startTime);
    const isOnline = nextApp.type === 'ONLINE';

    return (
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 h-full flex flex-col justify-between border-primary/20 hover:border-primary/50 transition-all relative overflow-hidden group shadow-dim">
            {/* Ambient Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between mb-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Próxima Sessão
                    </h3>
                    <h4 className="font-serif text-4xl text-white tracking-tight leading-none mb-2">
                        {format(appDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h4>
                    <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                        <Clock size={14} />
                        {format(appDate, "EEEE, 'às' HH:mm", { locale: ptBR })}
                    </p>
                </div>
                
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm backdrop-blur-md">
                    {isOnline ? <Video size={24} className="text-emeraldGlow-400" /> : <MapPin size={24} className="text-champagne-400" />}
                </div>
            </div>

            <div className="relative z-10">
                {/* Countdown */}
                {timeLeft && (
                    <div className="flex gap-4 mb-8">
                        {timeLeft.days > 0 && (
                            <div className="flex flex-col">
                                <span className="font-serif text-3xl text-white leading-none">{timeLeft.days}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Dias</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-serif text-3xl text-white leading-none">{timeLeft.hours}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Horas</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-3xl text-white leading-none">{timeLeft.minutes}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Minutos</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                    {isOnline && nextApp.meetLink ? (
                        <a 
                            href={nextApp.meetLink.startsWith('http') ? nextApp.meetLink : `https://${nextApp.meetLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex-1"
                        >
                            <Button className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-3 group/btn">
                                Acessar Sala
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </a>
                    ) : isOnline ? (
                        <Button disabled className="w-full sm:w-auto flex-1 h-14 rounded-2xl font-bold bg-white/5 text-muted-foreground uppercase tracking-widest text-xs cursor-not-allowed border border-white/10">
                            Link em breve
                        </Button>
                    ) : (
                        <Button disabled className="w-full sm:w-auto flex-1 h-14 rounded-2xl font-bold bg-white/5 text-white uppercase tracking-widest text-xs cursor-default border border-white/10">
                            Atendimento Presencial
                        </Button>
                    )}
                    
                    <div className="w-full sm:w-auto">
                        <CancellationButton appointmentId={nextApp.id} startTime={appDate.toISOString()} />
                    </div>
                </div>
            </div>
        </div>
    );
}
