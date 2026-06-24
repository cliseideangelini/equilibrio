"use client";

import { useState } from "react";
import { Clock, CheckCircle, AlertCircle, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";

interface DashboardStatsCardsProps {
    pendingAppointments: any[];
    completedAppointments: any[];
    absentAppointments: any[];
    dailyAppointments: any[];
}

export function DashboardStatsCards({
    pendingAppointments,
    completedAppointments,
    absentAppointments,
    dailyAppointments
}: DashboardStatsCardsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const stats = [
        { id: 'pending', label: "A Realizar", value: pendingAppointments.length, data: pendingAppointments, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        { id: 'completed', label: "Realizadas", value: completedAppointments.length, data: completedAppointments, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
        { id: 'absent', label: "Ausências/Canceladas", value: absentAppointments.length, data: absentAppointments, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
        { id: 'total', label: "Total do Dia", value: dailyAppointments.length, data: dailyAppointments, icon: FileText, color: "text-warm", bg: "bg-warm/10", border: "border-warm/20" },
    ];

    const activeStat = stats.find(s => s.id === selectedCategory);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div 
                        key={s.id} 
                        onClick={() => setSelectedCategory(s.id)}
                        className={cn(
                            "bg-surface/40 border rounded-2xl p-5 flex flex-col gap-4 shadow-sm backdrop-blur-md transition-all duration-300 cursor-pointer hover:bg-surface/60", 
                            s.border,
                            selectedCategory === s.id ? "ring-2 ring-primary/50" : "hover:translate-y-[-2px]"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">{s.label}</span>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", s.bg, s.border)}>
                                <s.icon className={cn("w-4 h-4", s.color)} />
                            </div>
                        </div>
                        <p className="text-3xl font-light text-foreground">{s.value}</p>
                    </div>
                ))}
            </div>

            <Dialog.Root open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/50 bg-surface/95 backdrop-blur-xl p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-3xl max-h-[85vh] flex flex-col">
                        
                        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                {activeStat && (
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", activeStat.bg, activeStat.border)}>
                                        <activeStat.icon className={cn("w-5 h-5", activeStat.color)} />
                                    </div>
                                )}
                                <div>
                                    <Dialog.Title className="text-xl font-serif font-bold text-foreground">
                                        {activeStat?.label}
                                    </Dialog.Title>
                                    <p className="text-sm text-muted-fg">{activeStat?.data.length} paciente(s) nesta categoria hoje</p>
                                </div>
                            </div>
                            <Dialog.Close className="rounded-full p-2 hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-muted-fg" />
                            </Dialog.Close>
                        </div>

                        <div className="overflow-y-auto pr-2 -mr-2 space-y-3 py-2 custom-scrollbar flex-1 min-h-[100px]">
                            {activeStat?.data.length === 0 ? (
                                <p className="text-center text-muted-fg py-8 italic">Nenhum agendamento nesta categoria.</p>
                            ) : (
                                activeStat?.data.map((app) => (
                                    <div key={app.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[60px] pr-4 border-r border-white/10">
                                                <span className="block text-xl font-light text-foreground leading-none">
                                                    {format(new Date(app.startTime), "HH:mm")}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{app.patient?.name || "Paciente"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={cn(
                                                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                        app.status === "COMPLETED" ? "bg-primary/10 text-primary border-primary/20" :
                                                        app.status === "ABSENT" || app.status === "CANCELLED" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    )}>
                                                        {app.status === "COMPLETED" ? "Realizada" :
                                                         app.status === "ABSENT" ? "Faltou" :
                                                         app.status === "CANCELLED" ? "Cancelada" :
                                                         app.status === "CONFIRMED" ? "Confirmada" : "Pendente"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/area-clinica/prontuarios/${app.patientId}`} onClick={() => setSelectedCategory(null)}>
                                            <button className="text-[10px] font-bold uppercase tracking-wider text-muted-fg hover:text-primary transition-colors px-3 py-1.5 border border-white/10 hover:border-primary/30 rounded-lg">
                                                Ver Prontuário
                                            </button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
