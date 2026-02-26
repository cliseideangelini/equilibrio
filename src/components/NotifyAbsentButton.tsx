"use client";

import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotifyAbsentButtonProps {
    phone: string;
    patientName: string;
}

export function NotifyAbsentButton({ phone, patientName }: NotifyAbsentButtonProps) {
    const handleNotify = () => {
        const message = `Olá ${patientName}, notamos sua ausência na consulta de hoje. Conforme nossa política de atendimento, consultas não desmarcadas com pelo menos 3 horas de antecedência são cobradas integralmente. Qualquer dúvida, estamos à disposição.`;
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleNotify}
            className="h-9 px-4 rounded-[1.2rem] text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 font-black text-[9px] uppercase tracking-wider transition-all border-stone-100"
        >
            <MessageSquareText size={12} className="mr-1.5" />
            Notificar Cobrança
        </Button>
    );
}
