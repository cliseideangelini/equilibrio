import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const availabilities = await prisma.availability.findMany({
    include: { psychologist: true }
  });
  console.log("Availabilities:", availabilities);

  const psychos = await prisma.psychologist.findMany();
  console.log("Psychologists:", psychos);
}

main().catch(console.error).finally(() => prisma.$disconnect());
