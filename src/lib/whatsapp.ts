import prisma from "@/lib/prisma";

/**
 * Sends a WhatsApp notification to the psychologist using CallMeBot API.
 * It uses the phone number and apikey configured in the psychologist's profile.
 */
export async function notifyPsychologist(message: string) {
    try {
        const psychologist = await prisma.psychologist.findFirst();
        
        if (!psychologist) return;
        
        // Verifica se notificações estão ativas e se tem número/chave configurados
        if (!psychologist.whatsappNotifications || !psychologist.whatsappNumber || !psychologist.whatsappApiKey) {
            console.log("⚠️ [WhatsApp Config] Notificações desativadas ou dados incompletos. Ignorando envio.");
            return;
        }

        let phone = psychologist.whatsappNumber.replace(/\D/g, ""); // Keep only numbers
        if (!phone.startsWith("55") && phone.length <= 11) {
             phone = `55${phone}`;
        }

        console.log(`💬 [WhatsApp Notification] Enviando para ${phone} via CallMeBot...`);
        
        const textEncoded = encodeURIComponent(message);
        const apiKey = psychologist.whatsappApiKey;
        const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${textEncoded}&apikey=${apiKey}`;

        const response = await fetch(apiUrl, { method: "GET" });

        if (response.ok) {
            console.log("✅ [WhatsApp] Mensagem CallMeBot enviada com sucesso.");
        } else {
            console.log(`❌ [WhatsApp] Falha ao enviar CallMeBot. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Notification Error] Falha na notificação:", err.message);
    }
}

export function formatAppointmentDetailsForWhatsApp(app: {
    patient: { name: string };
    startTime: Date;
    type: string;
}) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date(app.startTime));
    const map = parts.reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {} as Record<string, string>);

    const dateFormatted = `${map.day}/${map.month} às ${map.hour}:${map.minute}`;
    const modalidade = app.type === "ONLINE" ? "Online (Google Meet)" : "Presencial";
    return `📅 Data: ${dateFormatted}\n💻 Modalidade: ${modalidade}`;
}
