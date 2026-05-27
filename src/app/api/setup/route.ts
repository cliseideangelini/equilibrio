import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const hashedPassword = await bcrypt.hash("cliseide2025", 10);
        
        // 1. Try to add the column directly via SQL if it doesn't exist
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Psychologist" ADD COLUMN "username" TEXT UNIQUE;`);
        } catch (e: any) {
            console.log("Column might already exist or error: ", e.message);
        }

        // 2. Find existing psychologist
        const admin = await prisma.psychologist.findFirst();

        if (admin) {
            await prisma.psychologist.update({
                where: { id: admin.id },
                data: {
                    username: "cliseide.angelini",
                    password: hashedPassword,
                    email: "cliseide.angelini@equilibrio.local"
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
                    bio: "Psicóloga Clínica"
                }
            });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: "Usuário atualizado com sucesso para cliseide.angelini e senha atualizada." 
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
