import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- LIMPANDO BANCO DE DADOS ---')
  
  // Ordem reversa de dependência
  await prisma.payment.deleteMany({})
  await prisma.evolution.deleteMany({})
  await prisma.attachment.deleteMany({})
  await prisma.appointment.deleteMany({})
  await prisma.waitingList.deleteMany({})
  await prisma.availability.deleteMany({})
  await prisma.patient.deleteMany({})
  await prisma.psychologist.deleteMany({})

  console.log('--- LIMPEZA CONCLUÍDA ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
