import prisma from "@/lib/prisma";

/**
 * Sends a WhatsApp notification to the psychologist using CallMeBot API.
 * It uses the phone number and apikey configured in the psychologist's profile.
 */
export async function notifyPsychologist(message: string) {
    try {
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

        console.log(`💬 [WhatsApp Baileys] Enviando aviso para a psicóloga no número ${phone}...`);
        
        const apiUrl = `https://equilibrio-production.up.railway.app/send`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: phone,
                message: message
            })
        });

        if (response.ok) {
            console.log("✅ [WhatsApp Baileys] Aviso enviado com sucesso para a psicóloga.");
        } else {
            console.log(`❌ [WhatsApp Baileys] Falha ao enviar aviso. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Notification Error] Falha na notificação:", err.message);
    }
}

export async function notifyPatient(patientPhone: string, message: string) {
    try {
        let phone = patientPhone.replace(/\D/g, ""); // Keep only numbers
        if (!phone.startsWith("55") && phone.length <= 11) {
             phone = `55${phone}`;
        }

        console.log(`💬 [WhatsApp Baileys] Enviando mensagem para o paciente ${phone}...`);

        const apiUrl = `https://equilibrio-production.up.railway.app/send`;
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: phone,
                message: message
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ [WhatsApp Baileys] Mensagem enviada com sucesso para o paciente:", data);
        } else {
            console.log(`❌ [WhatsApp Baileys] Falha ao enviar mensagem. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Baileys Error] Falha na notificação do paciente:", err.message);
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
