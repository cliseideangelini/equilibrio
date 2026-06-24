"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Loader2, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createScheduleBlock, deleteScheduleBlock, getScheduleBlocks } from "@/lib/actions";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
    adminId: string;
}

export function PauseScheduleButton({ adminId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [blocks, setBlocks] = useState<any[]>([]);
    
    // Form state
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [isAutoUnlock, setIsAutoUnlock] = useState(false);
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reason, setReason] = useState("");

    // Generate time options (06:00 to 22:00)
    const timeOptions = [];
    for (let h = 6; h <= 22; h++) {
        timeOptions.push(`${String(h).padStart(2, '0')}:00`);
        timeOptions.push(`${String(h).padStart(2, '0')}:30`);
    }

    const fetchBlocks = async () => {
        const data = await getScheduleBlocks();
        setBlocks(data);
    };

    useEffect(() => {
        if (isOpen) {
            fetchBlocks();
        }
    }, [isOpen]);

    const handleCreateBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!startDate || !startTime) {
            toast.error("Data e hora de início são obrigatórias.");
            return;
        }

        const startDateTime = new Date(`${startDate}T${startTime}:00-03:00`);
        let endDateTime = null;

        if (isAutoUnlock) {
            if (!endDate || !endTime) {
                toast.error("Data e hora de fim são obrigatórias para desbloqueio automático.");
                return;
            }
            endDateTime = new Date(`${endDate}T${endTime}:00-03:00`);
            
            if (endDateTime <= startDateTime) {
                toast.error("A data de fim deve ser posterior à data de início.");
                return;
            }
        }

        setLoading(true);
        try {
            const result = await createScheduleBlock(adminId, startDateTime, endDateTime, reason);
            if (result.success) {
                toast.success("Bloqueio adicionado com sucesso!");
                setStartDate("");
                setStartTime("");
                setEndDate("");
                setEndTime("");
                setIsAutoUnlock(false);
                setReason("");
                await fetchBlocks();
            } else {
                toast.error(result.error);
            }
        } catch (e) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        if (!window.confirm("Remover este bloqueio? A agenda voltará ao normal neste período.")) return;
        
        try {
            const result = await deleteScheduleBlock(id);
            if (result.success) {
                toast.success("Bloqueio removido.");
                await fetchBlocks();
            } else {
                toast.error(result.error);
            }
        } catch (e) {
            toast.error("Erro na comunicação com o servidor.");
        }
    };

    const activeBlocksCount = blocks.filter(b => b.endDate === null || new Date(b.endDate) > new Date()).length;

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Trigger asChild>
                <button
                    className={cn(
                        "hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl border",
                        activeBlocksCount > 0 
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 shadow-[0_0_15px_-4px_rgba(244,63,94,0.35)]" 
                            : "bg-surface text-muted-fg border-border hover:bg-surface-hover"
                    )}
                >
                    {activeBlocksCount > 0 ? <Lock size={16} /> : <Calendar size={16} />}
                    {activeBlocksCount > 0 ? `${activeBlocksCount} Bloqueio(s)` : "Travar Agenda"}
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/50 bg-surface/95 backdrop-blur-xl p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
                    
                    <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-serif font-bold text-foreground">
                            Gerenciar Bloqueios de Agenda
                        </Dialog.Title>
                        <Dialog.Close className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-muted-fg" />
                        </Dialog.Close>
                    </div>

                    <div className="mt-4 space-y-6">
                        {/* Formulário */}
                        <form onSubmit={handleCreateBlock} className="space-y-4 p-4 border border-white/5 rounded-xl bg-white/5">
                            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Novo Bloqueio
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-fg">Data Início</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-muted-fg">Hora Início</label>
                                    <select value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="" disabled>Selecione</option>
                                        {timeOptions.map(time => (
                                            <option key={`start-${time}`} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input type="checkbox" checked={isAutoUnlock} onChange={e => setIsAutoUnlock(e.target.checked)} className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary/20" />
                                <span className="text-sm text-muted-fg">Retorno Automático (Destravar)</span>
                            </label>

                            {isAutoUnlock && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-muted-fg">Data Fim</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-muted-fg">Hora Fim</label>
                                        <select value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                            <option value="" disabled>Selecione</option>
                                            {timeOptions.map(time => (
                                                <option key={`end-${time}`} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-fg">Motivo (Opcional)</label>
                                <input type="text" placeholder="Ex: Feriado, Curso..." value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-primary-fg font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar Bloqueio"}
                            </button>
                        </form>

                        {/* Lista de bloqueios */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Bloqueios Ativos
                            </h3>
                            {blocks.length === 0 ? (
                                <p className="text-sm text-muted-fg italic text-center py-4">Nenhum bloqueio programado.</p>
                            ) : (
                                <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                    {blocks.map(block => (
                                        <li key={block.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {new Date(block.startDate).toLocaleDateString('pt-BR')} {new Date(block.startDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                                <p className="text-xs text-muted-fg">
                                                    Até: {block.endDate ? `${new Date(block.endDate).toLocaleDateString('pt-BR')} ${new Date(block.endDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}` : "Manual"}
                                                </p>
                                                {block.reason && <p className="text-xs text-primary/80 mt-1">{block.reason}</p>}
                                            </div>
                                            <button onClick={() => handleDeleteBlock(block.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-md transition-colors" title="Remover Bloqueio">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
