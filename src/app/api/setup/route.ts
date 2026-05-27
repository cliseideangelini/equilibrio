import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash("cliseide2025", 10);
        
        // Find existing psychologist
        const admin = await prisma.psychologist.findFirst();

        if (admin) {
            await prisma.psychologist.update({
                where: { id: admin.id },
                data: {
                    username: "cliseide.angelini",
                    password: hashedPassword,
                    email: "cliseide.angelini@equilibrio.local" // We keep a dummy email since it's required by the database structure
                }
            });
        } else {
            // Create if it doesn't exist for some reason
            await prisma.psychologist.create({
                data: {
                    name: "Cliseide S. Angelini",
                    username: "cliseide.angelini",
                    password: hashedPassword,
                    email: "cliseide.angelini@equilibrio.local",
                    crp: "06/000000",
                    bio: "Psicóloga Clínica",
                    phone: "(00) 00000-0000"
                }
            });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: "Usuário atualizado com sucesso para cliseide.angelini" 
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
