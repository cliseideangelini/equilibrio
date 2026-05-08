import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const patients = await prisma.patient.findMany({ take: 1 });
    console.log("Patient schema check successful.");
    console.log("Sample patient keys:", patients[0] ? Object.keys(patients[0]) : "No patients found");
  } catch (error: any) {
    console.error("Schema check failed!");
    console.error(error.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
