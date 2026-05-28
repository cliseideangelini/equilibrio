import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const results = [];
        
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Psychologist" ADD COLUMN "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false;`);
            results.push("Adicionada coluna whatsappNotifications.");
        } catch (e: any) {
            results.push(`whatsappNotifications: ${e.message}`);
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Psychologist" ADD COLUMN "whatsappNumber" TEXT;`);
            results.push("Adicionada coluna whatsappNumber.");
        } catch (e: any) {
            results.push(`whatsappNumber: ${e.message}`);
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Psychologist" ADD COLUMN "whatsappApiKey" TEXT;`);
            results.push("Adicionada coluna whatsappApiKey.");
        } catch (e: any) {
            results.push(`whatsappApiKey: ${e.message}`);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Atualização do banco de dados concluída.",
            details: results
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
