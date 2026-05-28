import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Sends a WhatsApp notification to the psychologist.
 * It uses the phone number configured in the psychologist's profile.
 * If WHATSAPP_API_URL and WHATSAPP_API_TOKEN are configured, it sends an HTTP POST request.
 * Otherwise, it logs to the console for easy integration.
 */
export async function notifyPsychologist(message: string) {
    try {
        const psychologist = await prisma.psychologist.findFirst();
        if (!psychologist || !psychologist.phone) {
            console.log("⚠️ [WhatsApp Config] psychologist or phone number not set. Notification skipped.");
            console.log(`Message would be: \n"${message}"`);
            return;
        }

        const phone = psychologist.phone.replace(/\D/g, ""); // Keep only numbers
        const cleanPhone = phone.startsWith("55") ? phone : `55${phone}`;

        console.log(`💬 [WhatsApp Notification] Sending to ${cleanPhone}:`);
        console.log(`-----------------------------------------\n${message}\n-----------------------------------------`);

        const apiUrl = process.env.WHATSAPP_API_URL;
        const token = process.env.WHATSAPP_API_TOKEN;

        if (apiUrl) {
            // Standard Z-API / Evolution API format or custom webhook
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    phone: cleanPhone,
                    message: message
                })
            });

            if (response.ok) {
                console.log("✅ [WhatsApp] HTTP POST sent successfully.");
            } else {
                console.log(`❌ [WhatsApp] Failed to send HTTP POST. Status: ${response.status}`);
            }
        }
    } catch (err: any) {
        console.error("❌ [WhatsApp Notification Error] Failed to send notification:", err.message);
    }
}

export function formatAppointmentDetailsForWhatsApp(app: {
    patient: { name: string };
    startTime: Date;
    type: string;
}) {
    const dateFormatted = format(new Date(app.startTime), "dd/MM 'às' HH:mm", { locale: ptBR });
    const modalidade = app.type === "ONLINE" ? "Online (Google Meet)" : "Presencial";
    return `📅 Data: ${dateFormatted}\n💻 Modalidade: ${modalidade}`;
}
