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

export async function notifyPatient(patientPhone: string, templateName: string, parameters: any[]) {
    try {
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            console.log("⚠️ [WhatsApp Meta] Token ou Phone Number ID não configurados nas variáveis de ambiente. Ignorando envio.");
            return;
        }

        let phone = patientPhone.replace(/\D/g, ""); // Keep only numbers
        if (!phone.startsWith("55") && phone.length <= 11) {
             phone = `55${phone}`;
        }

        console.log(`💬 [WhatsApp Meta] Enviando template "${templateName}" para o paciente ${phone}...`);

        const apiUrl = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: "pt_BR"
                    },
                    components: parameters.length > 0 ? [
                        {
                            type: "body",
                            parameters: parameters
                        }
                    ] : []
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ [WhatsApp Meta] Mensagem enviada com sucesso para o paciente:", data);
        } else {
            console.log(`❌ [WhatsApp Meta] Falha ao enviar mensagem. Status: ${response.status}`);
            const errorText = await response.text();
            console.log(`Motivo: ${errorText}`);
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Meta Error] Falha na notificação do paciente:", err.message);
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
