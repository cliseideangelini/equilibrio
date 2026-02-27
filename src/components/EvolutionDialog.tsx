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
import { Loader2, Plus } from "lucide-react";

interface EvolutionDialogProps {
    patientId: string;
    appointmentId: string;
    initialContent?: string;
    trigger?: React.ReactNode;
}

export function EvolutionDialog({ patientId, appointmentId, initialContent = "", trigger }: EvolutionDialogProps) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPending, setIsPending] = useState(false);

    const handleSave = async () => {
        if (!content.trim() && !initialContent) return;
        setIsPending(true);
        try {
            await saveEvolution(patientId, appointmentId, content, new Date(date));
            setOpen(false);
        } catch (error) {
            console.error("Error saving evolution:", error);
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
            <DialogContent className="sm:max-w-[600px] border-stone-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-light text-stone-900">Evolução Clínica</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Data da Evolução</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-10 px-4 rounded-xl border border-stone-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                        />
                    </div>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Descreva o andamento da sessão, observações relevantes e condutas..."
                        className="min-h-[300px] text-sm leading-relaxed border-stone-100 focus:ring-stone-200"
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-stone-400">Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-stone-900 text-white rounded-xl h-11 px-8 font-bold text-[10px] uppercase tracking-widest"
                    >
                        {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                        Salvar Evolução
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
