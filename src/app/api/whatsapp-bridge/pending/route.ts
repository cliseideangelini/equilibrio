import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fila de mensagens de WhatsApp que falharam ao enviar (robô estava desconectado).
// O robô consulta essa fila periodicamente e reenvia assim que reconectar.
// Protegido por um segredo compartilhado — nunca exposto ao navegador.

function isAuthorized(req: Request) {
    const secret = process.env.WHATSAPP_BRIDGE_SECRET;
    if (!secret) return false;
    return req.headers.get("x-bridge-secret") === secret;
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pending = await prisma.pendingWhatsAppMessage.findMany({
        where: { status: "PENDING", attempts: { lt: 8 } },
        orderBy: { createdAt: "asc" },
        take: 20,
    });

    return NextResponse.json({ pending });
}

export async function PATCH(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, lastError } = body;

    if (!id || !["SENT", "FAILED", "PENDING"].includes(status)) {
        return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    await prisma.pendingWhatsAppMessage.update({
        where: { id },
        data: {
            status,
            lastError: lastError || null,
            attempts: { increment: 1 },
        },
    });

    return NextResponse.json({ success: true });
}
