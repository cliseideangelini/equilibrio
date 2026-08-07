import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyPatient, notifyPsychologist } from "@/lib/whatsapp";

// Função para enviar o menu inicial
async function sendMenu(phone: string) {
    const menuMessage = `Olá! Bem-vindo(a) ao canal de atendimento da clínica Equilíbrio. 🌿\n\nComo posso ajudar você hoje? Responda com o número da opção desejada:\n\n*1* - Agendar consulta, ver minha agenda ou assuntos gerais\n*2* - Falar diretamente com a Cliseide (Urgências ou Transbordo)`;
    await notifyPatient(phone, menuMessage);
}

function isAuthorized(req: Request) {
    const secret = process.env.WHATSAPP_BRIDGE_SECRET;
    if (!secret) return false;
    return req.headers.get("x-bridge-secret") === secret;
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Espera-se que o payload do Baileys tenha: { phone: "551999999999", text: "Mensagem do usuário" }
        const { phone, text } = body;

        if (!phone || !text) {
            return NextResponse.json({ success: false, error: "Parâmetros 'phone' ou 'text' ausentes." }, { status: 400 });
        }

        // Limpa o número para padronizar
        const cleanPhone = phone.replace(/\D/g, "");

        // Buscar sessão ativa do usuário
        let session = await prisma.whatsAppSession.findUnique({
            where: { phone: cleanPhone }
        });

        const now = new Date();
        
        // Se a sessão existir, verificar se expirou (ex: mais de 24 horas)
        if (session) {
            const hoursSinceLastUpdate = (now.getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastUpdate > 24) {
                // Reiniciar sessão expirada
                session = await prisma.whatsAppSession.update({
                    where: { phone: cleanPhone },
                    data: { state: "MENU", updatedAt: now }
                });
                await sendMenu(cleanPhone);
                return NextResponse.json({ success: true, action: "SESSION_EXPIRED_SENT_MENU" });
            }
        } else {
            // Criar nova sessão
            session = await prisma.whatsAppSession.create({
                data: { phone: cleanPhone, state: "MENU" }
            });
            await sendMenu(cleanPhone);
            return NextResponse.json({ success: true, action: "NEW_SESSION_SENT_MENU" });
        }

        // Máquina de Estados
        const userText = text.trim();

        if (session.state === "MENU") {
            if (userText === "1") {
                // Direcionar para agendamento
                await notifyPatient(cleanPhone, `Ótimo! Você pode realizar o seu agendamento, consultar seus horários e realizar pagamentos através do nosso portal seguro:\n\n👉 https://equilibrio-psi.vercel.app\n\nSe precisar de mais alguma coisa, estarei por aqui!`);
                await prisma.whatsAppSession.update({
                    where: { phone: cleanPhone },
                    data: { state: "SCHEDULING" }
                });
                return NextResponse.json({ success: true, action: "ROUTED_SCHEDULING" });
            } else if (userText === "2") {
                // Rota de urgência / Transbordo
                await notifyPatient(cleanPhone, `Entendi. Sua mensagem foi encaminhada diretamente para a Cliseide. Por favor, aguarde que ela entrará em contato com você o mais rápido possível.`);
                await notifyPsychologist(`🚨 *Novo Transbordo*\nUm paciente solicitou contato direto pelo WhatsApp.\nNúmero: +${cleanPhone}`);
                
                await prisma.whatsAppSession.update({
                    where: { phone: cleanPhone },
                    data: { state: "TRANSBORDO" }
                });
                return NextResponse.json({ success: true, action: "ROUTED_TRANSBORDO" });
            } else {
                // Resposta inválida, enviar menu novamente
                await sendMenu(cleanPhone);
                return NextResponse.json({ success: true, action: "INVALID_OPTION_SENT_MENU" });
            }
        } else if (session.state === "SCHEDULING" || session.state === "TRANSBORDO") {
            // Se já foi direcionado mas mandou nova mensagem em menos de 24h
            // Podemos notificar a psicóloga caso o paciente mande mais coisas no transbordo
            if (session.state === "TRANSBORDO") {
                 await notifyPsychologist(`📩 *Mensagem Recebida (Transbordo)*\nPaciente: +${cleanPhone}\nMensagem: ${text}`);
            }
            
            // Atualizar o timestamp para manter a sessão viva
            await prisma.whatsAppSession.update({
                where: { phone: cleanPhone },
                data: { updatedAt: now }
            });
            
            return NextResponse.json({ success: true, action: "MESSAGE_LOGGED" });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Erro no Webhook do WhatsApp:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
