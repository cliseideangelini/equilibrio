import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Rota temporaria e protegida para definir usuario/senha da profissional.
// Remover apos o uso pontual.

function isAuthorized(req: Request) {
    const secret = process.env.WHATSAPP_BRIDGE_SECRET;
    if (!secret) return false;
    return req.headers.get("x-bridge-secret") === secret;
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json({ error: "username e password são obrigatórios." }, { status: 400 });
    }

    const psychologist = await prisma.psychologist.findFirst();
    if (!psychologist) {
        return NextResponse.json({ error: "Nenhuma psicóloga encontrada." }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const updated = await prisma.psychologist.update({
        where: { id: psychologist.id },
        data: { username, password: hashed }
    });

    return NextResponse.json({
        success: true,
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username
    });
}
