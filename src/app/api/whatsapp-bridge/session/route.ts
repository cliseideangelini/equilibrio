import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Backup/restauração da sessão do WhatsApp (Baileys) usada pelo robô de envio.
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

    const record = await prisma.whatsAppBridgeSession.findUnique({ where: { id: "main" } });
    return NextResponse.json({ data: record?.data || null });
}

export async function PUT(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    if (typeof body.data !== "string") {
        return NextResponse.json({ error: "Campo 'data' é obrigatório." }, { status: 400 });
    }

    await prisma.whatsAppBridgeSession.upsert({
        where: { id: "main" },
        create: { id: "main", data: body.data },
        update: { data: body.data },
    });

    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.whatsAppBridgeSession.deleteMany({ where: { id: "main" } });
    return NextResponse.json({ success: true });
}
