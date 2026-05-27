import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.psychologist.update({
        where: { email: 'cliseideangelini@gmail.com' },
        data: { username: 'cliseide.angelini' }
    });
    console.log('Username updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
