"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addAttachment } from "@/lib/actions";
import { Loader2, Plus, FileUp } from "lucide-react";

interface AttachmentUploadProps {
    patientId: string;
}

export function AttachmentUpload({ patientId }: AttachmentUploadProps) {
    const [isPending, setIsPending] = useState(false);

    const handleUpload = async () => {
        // Simulação de upload para simplificar o fluxo de teste sem bucket configurado
        setIsPending(true);
        try {
            // No futuro aqui viria o upload para o Vercel Blob ou similar
            await addAttachment(
                patientId,
                "Documento_Teste.pdf",
                "#",
                "application/pdf"
            );
        } catch (error) {
            console.error("Error adding attachment:", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Documentos</h3>
            <div className="p-10 text-center border-2 border-dashed border-stone-100 rounded-xl bg-stone-50/20 group hover:border-stone-200 transition-colors">
                <FileUp className="w-8 h-8 text-stone-100 mx-auto mb-4 group-hover:text-stone-200 transition-colors" />
                <p className="text-[10px] text-stone-300 font-black uppercase tracking-widest leading-relaxed">
                    Clique abaixo para anexar PDFs, imagens ou laudos
                </p>
            </div>
            <Button
                variant="ghost"
                onClick={handleUpload}
                disabled={isPending}
                className="w-full text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-widest gap-2 h-10"
            >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Fazer upload
            </Button>
        </div>
    );
}
