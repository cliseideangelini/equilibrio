import { google } from "googleapis";
import { addMinutes } from "date-fns";

// Cria um cliente OAuth2 com as credenciais da conta da Dra. Cliseide
function getOAuth2Client() {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return client;
}

export async function createGoogleCalendarEvent(params: {
    patientName: string;
    startTime: Date;
    durationMinutes: number;
    type: "ONLINE" | "PRESENCIAL";
}) {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth });

    const endTime = addMinutes(params.startTime, params.durationMinutes);
    const isOnline = params.type === "ONLINE";

    try {
        const event = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: isOnline ? 1 : 0,
            requestBody: {
                summary: `Sessão ${isOnline ? "Online" : "Presencial"} - ${params.patientName}`,
                description: `Consulta de psicoterapia com Cliseide S. Angelini (CRP 123230)\nTipo: ${params.type}\nWpp: 19 98827-52-90`,
                location: isOnline ? "Google Meet" : "Consultório Presencial",
                start: {
                    dateTime: params.startTime.toISOString(),
                    timeZone: "America/Sao_Paulo",
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: "America/Sao_Paulo",
                },
                conferenceData: isOnline ? {
                    createRequest: {
                        requestId: `equilibrio-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                } : undefined,
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 180 },
                        { method: "popup", minutes: 15 },
                    ],
                },
            },
        });

        // Extrair o link do Google Meet se existir
        const meetLink =
            event.data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri ||
            event.data.hangoutLink ||
            null;

        if (isOnline && !meetLink) {
            console.warn("[Google Calendar] Evento criado, mas nenhum meetLink foi gerado. Verifique as permissões de conferência da conta.");
        }

        return { eventId: event.data.id, meetLink };
    } catch (error: any) {
        console.error("Erro completo do Google Calendar:", JSON.stringify(error, null, 2));
        throw error;
    }
}
