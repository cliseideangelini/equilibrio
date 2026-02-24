const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const apps = await prisma.appointment.findMany({
        where: { type: 'ONLINE' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, meetLink: true, status: true, patient: { select: { name: true } } }
    });
    console.log(JSON.stringify(apps, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
