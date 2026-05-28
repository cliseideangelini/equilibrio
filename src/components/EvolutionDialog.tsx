"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveEvolution } from "@/lib/actions";
import { Loader2, Plus, CloudCheck, Cloud } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useCallback, useRef } from "react";

interface EvolutionDialogProps {
    patientId: string;
    appointmentId: string;
    initialContent?: string;
    trigger?: React.ReactNode;
}

export function EvolutionDialog({ patientId, appointmentId, initialContent = "", trigger }: EvolutionDialogProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [date, setDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const lastSavedContent = useRef(initialContent);

    useEffect(() => {
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    // Simple debounce implementation
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedSaveDraft = useCallback((newContent: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(async () => {
            if (!newContent.trim() || newContent === lastSavedContent.current) return;
            setIsSavingDraft(true);
            try {
                await saveEvolution(patientId, appointmentId, newContent, new Date(date), true);
                lastSavedContent.current = newContent;
            } catch (error) {
                console.error("Erro ao salvar rascunho:", error);
            } finally {
                setIsSavingDraft(false);
            }
        }, 2000);
    }, [patientId, appointmentId, date]);

    useEffect(() => {
        if (open && content !== initialContent) {
            debouncedSaveDraft(content);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [content, open, debouncedSaveDraft, initialContent]);

    const handleSave = async () => {
        if (!content.trim() && !initialContent) return;
        setIsPending(true);
        try {
            await saveEvolution(patientId, appointmentId, content, new Date(date), false);
            toast.success("Evolução salva com sucesso!");
            setOpen(false);
        } catch (error) {
            console.error("Error saving evolution:", error);
            toast.error("Erro ao salvar evolução.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="rounded-xl bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest h-10 px-6 border-0">
                        <Plus size={14} className="mr-2" /> Nova Evolução
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] w-[95vw] h-[90vh] sm:h-auto border-stone-200 flex flex-col p-0 overflow-hidden rounded-[2rem]">
                <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 border-b border-stone-50">
                    <DialogTitle className="text-xl font-light text-stone-900">Evolução <span className="italic font-serif">Clínica</span></DialogTitle>
                    <div className="flex items-center gap-2 pr-6">
                        {isSavingDraft ? (
                            <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-stone-400">
                                <Cloud size={10} className="animate-pulse" /> Salvando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                <CloudCheck size={10} /> Sincronizado
                            </span>
                        )}
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Data da Atividade</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-100 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                        />
                    </div>
                    <div className="flex-1 flex flex-col min-h-[350px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1 mb-1.5">Conteúdo da Evolução</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Descreva o andamento da sessão, observações relevantes e condutas..."
                            className="flex-1 min-h-[300px] text-base leading-relaxed border-stone-100 focus:ring-stone-200 rounded-2xl p-4 bg-stone-50/50"
                        />
                    </div>
                </div>
                <DialogFooter className="p-6 bg-stone-50/30 border-t border-stone-50 flex flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-stone-400 h-12 px-6">Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-stone-900 text-white rounded-xl h-12 px-10 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200 flex-1 sm:flex-none"
                    >
                        {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                        Finalizar e Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
