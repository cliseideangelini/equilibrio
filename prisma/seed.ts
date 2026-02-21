import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const cliseide = await prisma.psychologist.upsert({
        where: { email: 'Cliseideangelini@gmail.com' },
        update: {
            name: 'Cliseide S. Angelini',
            crp: '123230',
            bio: 'Psicóloga clínica - atendimento infantil, adolescentes, adultos, idosos e pacientes oncológicos; especialista em terapia cognitivo comportamental; avaliação psicológica.',
            phone: '19 98827-52-90'
        },
        create: {
            name: 'Cliseide S. Angelini',
            email: 'Cliseideangelini@gmail.com',
            crp: '123230',
            bio: 'Psicóloga clínica - atendimento infantil, adolescentes, adultos, idosos e pacientes oncológicos; especialista em terapia cognitivo comportamental; avaliação psicológica.',
            phone: '19 98827-52-90'
        },
    })

    // Limpar disponibilidades antigas
    await prisma.availability.deleteMany({ where: { psychologistId: cliseide.id } })

    // Segunda (1): 14:30 às 17:30
    await prisma.availability.create({
        data: {
            dayOfWeek: 1,
            startTime: 870, // 14:30
            endTime: 1080,  // 18:00  (permite slot das 17:30)
            psychologistId: cliseide.id,
        }
    })

    // Terça (2) a Sexta (5)
    for (let i = 2; i <= 5; i++) {
        // Manhã: 07:00 às 11:30
        await prisma.availability.create({
            data: {
                dayOfWeek: i,
                startTime: 420, // 07:00
                endTime: 690,  // 11:30
                psychologistId: cliseide.id,
            }
        })
        // Tarde: 14:30 às 17:30
        await prisma.availability.create({
            data: {
                dayOfWeek: i,
                startTime: 870, // 14:30
                endTime: 1080,  // 18:00  (permite slot das 17:30)
                psychologistId: cliseide.id,
            }
        })
    }

    console.log('Seed completo!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
