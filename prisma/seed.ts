import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const cliseide = await prisma.psychologist.upsert({
        where: { email: 'cliseide@exemplo.com' },
        update: {},
        create: {
            name: 'Cliseide S. Angelini',
            email: 'cliseide@exemplo.com',
            crp: '123230',
            bio: 'Especialista em TCC',
        },
    })

    // Segunda a Sexta, 09:00 às 18:00 (540 min às 1080 min)
    for (let i = 1; i <= 5; i++) {
        await prisma.availability.create({
            data: {
                dayOfWeek: i,
                startTime: 540,
                endTime: 1080,
                psychologistId: cliseide.id,
            },
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
