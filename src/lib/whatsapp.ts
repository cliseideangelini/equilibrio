import prisma from "@/lib/prisma";

// Guarda a mensagem para reenvio automático quando o robô de WhatsApp estiver
// desconectado/fora do ar, em vez de perdê-la silenciosamente.
async function queuePendingMessage(phone: string, message: string) {
    try {
        await prisma.pendingWhatsAppMessage.create({
            data: { phone, message }
        });
        console.log(`📥 [WhatsApp] Mensagem para ${phone} guardada na fila para reenvio automático.`);
    } catch (err: any) {
        console.error("❌ [WhatsApp] Falha ao guardar mensagem na fila de reenvio:", err.message);
    }
}

/**
 * Sends a WhatsApp notification to the psychologist using CallMeBot API.
 * It uses the phone number and apikey configured in the psychologist's profile.
 */
export async function notifyPsychologist(message: string) {
    const psychologist = await prisma.psychologist.findFirst();
    if (!psychologist) return;

    // Verifica se notificações estão ativas e se tem número configurado
    if (!psychologist.whatsappNotifications || !psychologist.whatsappNumber) {
        console.log("⚠️ [WhatsApp Config] Notificações desativadas ou número não configurado. Ignorando envio.");
        return;
    }

    let phone = psychologist.whatsappNumber.replace(/\D/g, ""); // Keep only numbers
    if (!phone.startsWith("55") && phone.length <= 11) {
        phone = `55${phone}`;
    }

    try {
        console.log(`💬 [WhatsApp Baileys] Enviando aviso para a psicóloga no número ${phone}...`);

        const apiUrl = `https://equilibrio-whatsapp-bridge.onrender.com/send`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: phone,
                message: message
            }),
            signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
            console.log("✅ [WhatsApp Baileys] Aviso enviado com sucesso para a psicóloga.");
        } else {
            console.log(`❌ [WhatsApp Baileys] Falha ao enviar aviso. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
            await queuePendingMessage(phone, message);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Notification Error] Falha na notificação:", err.message);
        await queuePendingMessage(phone, message);
    }
}

export async function notifyPatient(patientPhone: string, message: string) {
    let phone = patientPhone.replace(/\D/g, ""); // Keep only numbers
    if (!phone.startsWith("55") && phone.length <= 11) {
        phone = `55${phone}`;
    }

    try {
        console.log(`💬 [WhatsApp Baileys] Enviando mensagem para o paciente ${phone}...`);

        const apiUrl = `https://equilibrio-whatsapp-bridge.onrender.com/send`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: phone,
                message: message
            }),
            signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ [WhatsApp Baileys] Mensagem enviada com sucesso para o paciente:", data);
        } else {
            console.log(`❌ [WhatsApp Baileys] Falha ao enviar mensagem. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
            await queuePendingMessage(phone, message);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Baileys Error] Falha na notificação do paciente:", err.message);
        await queuePendingMessage(phone, message);
    }
}

export function formatAppointmentDetailsForWhatsApp(app: {
    patient: { name: string };
    startTime: Date;
    type: string;
    meetLink?: string | null;
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
    let details = `📅 Data: ${dateFormatted}\n💻 Modalidade: ${modalidade}`;
    if (app.type === "ONLINE" && app.meetLink) {
        details += `\n🔗 Link da reunião: ${app.meetLink}`;
    }
    return details;
}

export function formatDateTimeSimple(date: Date) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date(date));
    const map = parts.reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {} as Record<string, string>);

    return `${map.day}/${map.month} às ${map.hour}:${map.minute}`;
}
