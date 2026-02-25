"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentHistoryProps {
    appointments: any[];
    isSidebar?: boolean;
}

export function AppointmentHistory({ appointments, isSidebar }: AppointmentHistoryProps) {
    const [activeTab, setActiveTab] = useState<'realizadas' | 'canceladas' | 'tardias'>('realizadas');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const realizadas = appointments.filter((app: any) => app.status === 'CONFIRMED' && new Date(app.startTime) < new Date());
    const canceladas = appointments.filter((app: any) => app.status === 'CANCELLED' && !app.payment);
    const tardias = appointments.filter((app: any) => app.status === 'CANCELLED' && app.payment);

    if (!mounted) return <div className="animate-pulse bg-sage-50 h-32 rounded-2xl" />;

    return (
        <div className={cn("space-y-6", isSidebar ? "w-full" : "mt-8")}>
            {/* Tabs Minimalistas com Scroll */}
            <div className="flex p-1 bg-white/50 rounded-xl w-full overflow-x-auto no-scrollbar border border-sage-200">
                <button
                    onClick={() => setActiveTab('realizadas')}
                    className={cn(
                        "flex-1 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
                        activeTab === 'realizadas' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/40 hover:text-primary"
                    )}
                >
                    Realizadas ({realizadas.length})
                </button>
                <button
                    onClick={() => setActiveTab('canceladas')}
                    className={cn(
                        "flex-1 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
                        activeTab === 'canceladas' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/40 hover:text-primary"
                    )}
                >
                    Canceladas ({canceladas.length})
                </button>
                <button
                    onClick={() => setActiveTab('tardias')}
                    className={cn(
                        "flex-1 px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
                        activeTab === 'tardias' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/30 hover:text-primary"
                    )}
                >
                    Ausências ({tardias.length})
                </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                {activeTab === 'realizadas' && (
                    realizadas.length > 0 ? realizadas.map((app) => <HistoryItem key={app.id} app={app} icon={<CheckCircle2 className="w-3 h-3 text-green-500/30" />} />)
                        : <EmptyState message="Sem sessões realizadas." />
                )}
                {activeTab === 'canceladas' && (
                    canceladas.length > 0 ? canceladas.map((app) => <HistoryItem key={app.id} app={app} icon={<XCircle className="w-3 h-3 text-gray-200" />} />)
                        : <EmptyState message="Sem cancelamentos." />
                )}
                {activeTab === 'tardias' && (
                    tardias.length > 0 ? tardias.map((app) => <HistoryItem key={app.id} app={app} icon={<AlertTriangle className="w-3 h-3 text-amber-500/30" />} />)
                        : <EmptyState message="Sem ausências registradas." />
                )}
            </div>
        </div>
    );
}

function HistoryItem({ app, icon }: { app: any, icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white hover:bg-sage-50 rounded-2xl border border-primary/5 transition-all group">
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center min-w-[2rem]" suppressHydrationWarning>
                    <span className="text-[8px] font-black uppercase text-muted-foreground/30 leading-none">{format(new Date(app.startTime), 'MMM', { locale: ptBR })}</span>
                    <span className="text-base font-black text-muted-foreground/60 leading-none mt-1">{format(new Date(app.startTime), 'dd')}</span>
                </div>
                <div className="w-[1px] h-6 bg-sage-100" />
                <div suppressHydrationWarning>
                    <p className="font-bold text-xs text-foreground/60">{format(new Date(app.startTime), 'HH:mm')}</p>
                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-tighter">{app.type}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {app.payment && (
                    <p className="font-black text-[9px] text-primary/40 leading-none">R$ {app.payment.amount.toFixed(0)}</p>
                )}
                {icon}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-8 text-center text-[10px] text-muted-foreground opacity-30 italic font-medium">
            {message}
        </div>
    );
}
