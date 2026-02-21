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

export async function createGoogleMeetEvent(params: {
    patientName: string;
    startTime: Date;
    durationMinutes: number;
}) {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth });

    const endTime = addMinutes(params.startTime, params.durationMinutes);

    const event = await calendar.events.insert({
        calendarId: "primary", // Calendário principal da Dra. Cliseide
        conferenceDataVersion: 1,
        requestBody: {
            summary: `Sessão - ${params.patientName}`,
            description: `Consulta de psicoterapia com Cliseide S. Angelini (CRP 123230)\nWpp: 19 98827-52-90`,
            start: {
                dateTime: params.startTime.toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            conferenceData: {
                createRequest: {
                    // Código único para esta requisição (evita duplicatas)
                    requestId: `equilibrio-${params.startTime.getTime()}`,
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 180 },   // 3h antes por e-mail
                    { method: "popup", minutes: 15 },    // 15min pop-up
                ],
            },
        },
    });

    // Extrair o link do Google Meet do evento criado
    const meetLink =
        event.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === "video")?.uri ||
        event.data.hangoutLink ||
        null;

    return { eventId: event.data.id, meetLink };
}
