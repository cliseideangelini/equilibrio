"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Calendar, Clock, UserCheck, Search, Sparkles, Check, AlertCircle, RefreshCw } from "lucide-react";
import { updatePsychologistAvailability, updatePatientFixedSchedule } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvailabilityItem {
    dayOfWeek: number;
    startTimeStr: string;
    endTimeStr: string;
}

interface PatientItem {
    id: string;
    name: string;
    phone: string;
    isFixed: boolean;
    fixedDayOfWeek: number | null;
    fixedTime: string | null;
}

interface AgendaConfigClientProps {
    initialAvailabilities: {
        id: string;
        dayOfWeek: number;
        startTime: number;
        endTime: number;
    }[];
    patients: PatientItem[];
}

const WEEKDAYS = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
];

export function AgendaConfigClient({ initialAvailabilities, patients }: AgendaConfigClientProps) {
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | null }>({ text: "", type: null });

    // Converter minutos desde a meia-noite em formato HH:mm
    const formatMinutesToTimeStr = (min: number) => {
        const h = Math.floor(min / 60).toString().padStart(2, "0");
        const m = (min % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };

    // Disponibilidades atuais em estado local
    const [availabilities, setAvailabilities] = useState<AvailabilityItem[]>(() => 
        initialAvailabilities.map(av => ({
            dayOfWeek: av.dayOfWeek,
            startTimeStr: formatMinutesToTimeStr(av.startTime),
            endTimeStr: formatMinutesToTimeStr(av.endTime)
        }))
    );

    // Estado de controle para novas disponibilidades
    const [newDay, setNewDay] = useState<number>(1);
    const [newStart, setNewStart] = useState<string>("08:00");
    const [newEnd, setNewEnd] = useState<string>("18:00");

    // Estado dos pacientes e busca
    const [patientList, setPatientList] = useState<PatientItem[]>(patients);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Filtrar pacientes
    const filteredPatients = patientList.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showToast = (text: string, type: "success" | "error") => {
        setStatusMessage({ text, type });
        setTimeout(() => {
            setStatusMessage({ text: "", type: null });
        }, 4000);
    };

    // Adicionar slot de disponibilidade localmente
    const handleAddAvailability = () => {
        if (!newStart || !newEnd) return;
        if (newStart >= newEnd) {
            showToast("O horário de início deve ser anterior ao de término.", "error");
            return;
        }

        // Evitar duplicados idênticos
        const exists = availabilities.some(av => 
            av.dayOfWeek === newDay && 
            av.startTimeStr === newStart && 
            av.endTimeStr === newEnd
        );

        if (exists) {
            showToast("Este horário já foi adicionado.", "error");
            return;
        }

        const updated = [...availabilities, { dayOfWeek: newDay, startTimeStr: newStart, endTimeStr: newEnd }];
        // Ordenar por dia da semana e hora de início
        updated.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startTimeStr.localeCompare(b.startTimeStr);
        });

        setAvailabilities(updated);
        showToast("Horário adicionado à lista temporária. Lembre-se de Salvar!", "success");
    };

    // Remover slot localmente
    const handleRemoveAvailability = (index: number) => {
        const updated = availabilities.filter((_, idx) => idx !== index);
        setAvailabilities(updated);
        showToast("Horário removido da lista temporária. Clique em Salvar para consolidar.", "success");
    };

    // Salvar todas as disponibilidades no servidor
    const handleSaveAvailabilities = () => {
        startTransition(async () => {
            try {
                const res = await updatePsychologistAvailability(availabilities);
                if (res.success) {
                    showToast("Sua agenda e horários livres foram atualizados no sistema!", "success");
                } else {
                    showToast("Erro ao salvar disponibilidades: " + (res as any).error, "error");
                }
            } catch (err: any) {
                showToast("Erro ao salvar disponibilidades: " + err.message, "error");
            }
        });
    };

    // Salvar agenda de paciente fixo no servidor
    const handleSaveFixedPatient = (patientId: string, isFixed: boolean, day: number | null, time: string | null) => {
        if (isFixed && (day === null || !time)) {
            showToast("Selecione o dia e horário para o paciente fixo.", "error");
            return;
        }

        startTransition(async () => {
            try {
                const res = await updatePatientFixedSchedule(patientId, isFixed, day, time);
                if (res.success) {
                    setPatientList(prev => prev.map(p => 
                        p.id === patientId ? { ...p, isFixed, fixedDayOfWeek: day, fixedTime: time } : p
                    ));
                    showToast("Agenda fixa do paciente atualizada com sucesso!", "success");
                } else {
                    showToast("Erro ao salvar agenda do paciente: " + (res as any).error, "error");
                }
            } catch (err: any) {
                showToast("Erro ao salvar agenda do paciente: " + err.message, "error");
            }
        });
    };

    return (
        <div className="space-y-12 pb-16 animate-in fade-in duration-700 relative z-10">

            {/* Status Toast */}
            {statusMessage.text && (
                <div className={cn(
                    "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-lg transition-all animate-in slide-in-from-bottom-2",
                    statusMessage.type === "success" 
                        ? "bg-primary/10 border-primary/30 text-primary" 
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                )}>
                    {statusMessage.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-semibold tracking-wide">{statusMessage.text}</span>
                </div>
            )}

            {/* Top Area Info Banner */}
            <div className="bg-surface/30 border border-border/80 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Configurações Avançadas da Agenda</h3>
                        <p className="text-muted-fg text-sm mt-0.5 max-w-xl">
                            Gerencie os dias e horários em que você atende, e defina pacientes recorrentes para bloquear slots automáticos.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {isPending && (
                        <span className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Atualizando...
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. SEÇÃO DE DIAS E HORÁRIOS VAGOS (Col 7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-surface/30 border border-border/60 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-border/40 pb-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                1. Dias e Horários Disponíveis
                            </h2>
                            <Button 
                                onClick={handleSaveAvailabilities} 
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/95 text-foreground px-5 py-2 h-9 text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_-4px_rgba(29,184,127,0.35)]"
                            >
                                Salvar Grade Vaga
                            </Button>
                        </div>

                        {/* Formulário rápido para adicionar horário */}
                        <div className="bg-surface/50 border border-border/80 rounded-2xl p-4 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-fg">Liberar Novo Slot Vago</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">Dia da Semana</label>
                                    <select 
                                        value={newDay} 
                                        onChange={(e) => setNewDay(Number(e.target.value))}
                                        className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        {WEEKDAYS.map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">Horário de Início</label>
                                    <input 
                                        type="time" 
                                        value={newStart} 
                                        onChange={(e) => setNewStart(e.target.value)}
                                        className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">Horário de Término</label>
                                    <input 
                                        type="time" 
                                        value={newEnd} 
                                        onChange={(e) => setNewEnd(e.target.value)}
                                        className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={handleAddAvailability} 
                                className="w-full bg-surface/80 border border-border hover:bg-surface text-foreground py-2 h-9 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} className="text-primary" /> Adicionar na Lista
                            </Button>
                        </div>

                        {/* Listagem das disponibilidades configuradas */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-fg">Sua Grade de Horários Livres Atual</h3>
                            {availabilities.length === 0 ? (
                                <div className="border border-dashed border-border/80 rounded-2xl p-8 text-center text-muted-fg">
                                    <Clock className="w-8 h-8 text-border mx-auto mb-2" />
                                    <p className="text-sm font-medium">Nenhum horário livre configurado.</p>
                                    <p className="text-xs text-muted-fg mt-1">Selecione dias e horários acima para abrir sua agenda para marcações.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
                                    {availabilities.map((av, idx) => (
                                        <div 
                                            key={idx} 
                                            className="bg-surface/20 border border-border/60 hover:border-border rounded-xl p-3 flex items-center justify-between transition-all duration-300 animate-in fade-in"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(29,184,127,0.5)]" />
                                                <span className="text-xs font-bold text-foreground">
                                                    {WEEKDAYS.find(w => w.value === av.dayOfWeek)?.label || "Dia"}
                                                </span>
                                                <div className="h-4 w-px bg-border/60" />
                                                <span className="text-xs text-muted-fg flex items-center gap-1 font-medium">
                                                    <Clock size={12} className="text-primary" /> {av.startTimeStr} às {av.endTimeStr}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveAvailability(idx)}
                                                className="w-7 h-7 rounded-lg hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 text-muted-fg hover:text-rose-400 flex items-center justify-center transition-all group"
                                                title="Remover horário"
                                            >
                                                <Trash2 size={13} className="group-hover:scale-105 transition-transform" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. SEÇÃO DE PACIENTES FIXOS (Col 5/12) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-surface/30 border border-border/60 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                        <div className="border-b border-border/40 pb-4">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                2. Pacientes Fixos (Recorrentes)
                            </h2>
                            <p className="text-muted-fg text-xs mt-1">
                                Pacientes com horários bloqueados toda semana na mesma hora.
                            </p>
                        </div>

                        {/* Barra de pesquisa de pacientes */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-fg" />
                            <input 
                                type="text"
                                placeholder="Buscar paciente por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {/* Lista de pacientes */}
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {filteredPatients.length === 0 ? (
                                <div className="border border-dashed border-border/80 rounded-2xl p-6 text-center text-muted-fg text-xs">
                                    Nenhum paciente localizado.
                                </div>
                            ) : (
                                filteredPatients.map(patient => (
                                    <PatientConfigRow 
                                        key={patient.id} 
                                        patient={patient} 
                                        onSave={handleSaveFixedPatient}
                                        isPending={isPending}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

interface PatientConfigRowProps {
    patient: PatientItem;
    onSave: (id: string, isFixed: boolean, day: number | null, time: string | null) => void;
    isPending: boolean;
}

function PatientConfigRow({ patient, onSave, isPending }: PatientConfigRowProps) {
    const [isFixed, setIsFixed] = useState(patient.isFixed);
    const [dayOfWeek, setDayOfWeek] = useState<number>(patient.fixedDayOfWeek ?? 1);
    const [fixedTime, setFixedTime] = useState<string>(patient.fixedTime ?? "09:00");

    const hasChanges = isFixed !== patient.isFixed || 
                       (isFixed && (dayOfWeek !== patient.fixedDayOfWeek || fixedTime !== patient.fixedTime));

    return (
        <div className="bg-surface/40 border border-border/80 hover:border-border rounded-2xl p-4 space-y-3.5 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold text-foreground">{patient.name}</h4>
                    <span className="text-[10px] text-muted-fg">{patient.phone}</span>
                </div>

                {/* Toggle fixed */}
                <button
                    onClick={() => setIsFixed(!isFixed)}
                    className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all duration-300",
                        isFixed 
                            ? "bg-primary/10 text-primary border-primary/25 shadow-[0_0_8px_rgba(29,184,127,0.25)]" 
                            : "bg-surface border-border/80 text-muted-fg"
                    )}
                >
                    {isFixed ? "Fixo" : "Avulso"}
                </button>
            </div>

            {/* Painel de horário fixo */}
            {isFixed && (
                <div className="grid grid-cols-2 gap-2 bg-surface/50 border border-border/80 p-2.5 rounded-xl animate-in slide-in-from-top-1">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-fg block">Dia Fixo</label>
                        <select 
                            value={dayOfWeek} 
                            onChange={(e) => setDayOfWeek(Number(e.target.value))}
                            className="w-full bg-surface border border-border/80 rounded-lg px-2 py-1 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        >
                            {WEEKDAYS.map(d => (
                                <option key={d.value} value={d.value}>{d.label.replace("-feira", "")}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-muted-fg block">Hora Fixa</label>
                        <input 
                            type="time" 
                            value={fixedTime} 
                            onChange={(e) => setFixedTime(e.target.value)}
                            className="w-full bg-surface border border-border/80 rounded-lg px-2 py-1 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Salvar botão */}
            {hasChanges && (
                <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => onSave(patient.id, isFixed, isFixed ? dayOfWeek : null, isFixed ? fixedTime : null)}
                    className="w-full h-7 bg-primary text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
                >
                    Confirmar Configuração
                </Button>
            )}
        </div>
    );
}
