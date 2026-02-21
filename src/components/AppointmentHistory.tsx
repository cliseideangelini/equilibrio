"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppointmentHistoryProps {
    appointments: any[];
}

export function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [activeTab, setActiveTab] = useState<'realizadas' | 'canceladas' | 'tardias'>('realizadas');

    const realizadas = appointments.filter((app: any) => app.status === 'CONFIRMED' && new Date(app.startTime) < new Date());
    const canceladas = appointments.filter((app: any) => app.status === 'CANCELLED' && !app.payment);
    const tardias = appointments.filter((app: any) => app.status === 'CANCELLED' && app.payment);

    return (
        <div className="mt-8">
            <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full h-14 rounded-2xl border-dashed border-2 hover:border-primary/30 hover:bg-primary/5 transition-all gap-3 text-muted-foreground font-bold"
            >
                <History size={18} />
                {showHistory ? "Ocultar Histórico Completo" : "Ver Histórico Completo"}
                {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>

            {showHistory && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Tabs Minimalistas */}
                    <div className="flex p-1 bg-sage-100/50 rounded-xl w-fit mx-auto md:mx-0">
                        <button
                            onClick={() => setActiveTab('realizadas')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                activeTab === 'realizadas' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/60 hover:text-primary"
                            )}
                        >
                            Realizadas ({realizadas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('canceladas')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                activeTab === 'canceladas' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/60 hover:text-primary"
                            )}
                        >
                            Canceladas ({canceladas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('tardias')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                activeTab === 'tardias' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/60 hover:text-primary"
                            )}
                        >
                            Compulsórias ({tardias.length})
                        </button>
                    </div>

                    <div className="space-y-3">
                        {activeTab === 'realizadas' && (
                            realizadas.length > 0 ? realizadas.map((app) => <HistoryItem key={app.id} app={app} icon={<CheckCircle2 className="w-4 h-4 text-green-500/50" />} />)
                                : <EmptyState message="Nenhuma sessão realizada encontrada." />
                        )}
                        {activeTab === 'canceladas' && (
                            canceladas.length > 0 ? canceladas.map((app) => <HistoryItem key={app.id} app={app} icon={<XCircle className="w-4 h-4 text-gray-300" />} />)
                                : <EmptyState message="Nenhum cancelamento comum." />
                        )}
                        {activeTab === 'tardias' && (
                            tardias.length > 0 ? tardias.map((app) => <HistoryItem key={app.id} app={app} icon={<AlertTriangle className="w-4 h-4 text-amber-500/50" />} />)
                                : <EmptyState message="Sem cancelamentos tardios." />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function HistoryItem({ app, icon }: { app: any, icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-[1.25rem] border border-transparent hover:border-primary/10 transition-all">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
                    <span className="text-[9px] font-black uppercase text-muted-foreground/40 leading-none">{format(new Date(app.startTime), 'MMM', { locale: ptBR })}</span>
                    <span className="text-lg font-bold text-muted-foreground/70">{format(new Date(app.startTime), 'dd')}</span>
                </div>
                <div className="w-[1px] h-6 bg-border/40" />
                <div>
                    <p className="font-bold text-sm text-foreground/70 leading-tight">{format(new Date(app.startTime), 'HH:mm')}</p>
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter">{app.type === 'ONLINE' ? 'Online' : 'Presencial'}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {app.payment && (
                    <div className="text-right">
                        <p className="font-bold text-[10px]">R$ {app.payment.amount.toFixed(2)}</p>
                        <p className="text-[8px] font-black uppercase text-muted-foreground/40">{app.payment.status === 'PAID' ? 'Liquidado' : 'Aberto'}</p>
                    </div>
                )}
                {icon}
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-8 text-center text-xs text-muted-foreground italic font-medium opacity-50">
            {message}
        </div>
    );
}
