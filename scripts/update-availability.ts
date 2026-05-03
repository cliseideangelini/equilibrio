import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'Cliseideangelini@gmail.com';
    const psychologist = await prisma.psychologist.findUnique({ where: { email } });

    if (!psychologist) {
        console.log('Psicóloga não encontrada.');
        return;
    }

    // Limpar disponibilidades atuais
    await prisma.availability.deleteMany({ where: { psychologistId: psychologist.id } });

    // Segunda (1) a Sexta (5)
    for (let day = 1; day <= 5; day++) {
        // Shift 1: 07:00 - 11:30
        await prisma.availability.create({
            data: {
                dayOfWeek: day,
                startTime: 420, // 07:00
                endTime: 690,   // 11:30
                psychologistId: psychologist.id
            }
        });

        // Shift 2: 14:30 - 17:30
        await prisma.availability.create({
            data: {
                dayOfWeek: day,
                startTime: 870, // 14:30
                endTime: 1050,  // 17:30
                psychologistId: psychologist.id
            }
        });
    }

    console.log('Grade de horários atualizada com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
