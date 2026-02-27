import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const psychologist = await prisma.psychologist.findFirst({
            where: { email: 'Cliseideangelini@gmail.com' }
        });

        if (!psychologist) {
            return NextResponse.json({ error: "Psicóloga não encontrada" }, { status: 404 });
        }

        // Deletar todas as disponibilidades antigas
        await prisma.availability.deleteMany({
            where: { psychologistId: psychologist.id }
        });

        // Segunda (1): apenas tarde 14:30-17:30
        await prisma.availability.create({
            data: { dayOfWeek: 1, startTime: 870, endTime: 1050, psychologistId: psychologist.id }
        });

        // Terça a Sexta (2-5): manhã 07:00-11:30 + tarde 14:30-17:30
        for (const day of [2, 3, 4, 5]) {
            await prisma.availability.create({
                data: { dayOfWeek: day, startTime: 420, endTime: 690, psychologistId: psychologist.id }
            });
            await prisma.availability.create({
                data: { dayOfWeek: day, startTime: 870, endTime: 1050, psychologistId: psychologist.id }
            });
        }

        // Verificar o resultado
        const newAvailabilities = await prisma.availability.findMany({
            where: { psychologistId: psychologist.id },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const formatted = newAvailabilities.map(a => ({
            dia: dayNames[a.dayOfWeek],
            inicio: `${Math.floor(a.startTime / 60).toString().padStart(2, '0')}:${(a.startTime % 60).toString().padStart(2, '0')}`,
            fim: `${Math.floor(a.endTime / 60).toString().padStart(2, '0')}:${(a.endTime % 60).toString().padStart(2, '0')}`
        }));

        return NextResponse.json({
            success: true,
            message: "Disponibilidades atualizadas!",
            agenda: formatted
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
