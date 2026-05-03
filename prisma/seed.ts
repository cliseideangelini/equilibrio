import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  console.log('--- SEEDING ADMIN ---')
  
  const psychologist = await prisma.psychologist.upsert({
    where: { email: 'cliseideangelini@gmail.com' },
    update: {},
    create: {
      name: 'Cliseide S. Angelini',
      email: 'cliseideangelini@gmail.com',
      password: hashedPassword,
      crp: '06/123456',
      bio: 'Psicóloga Clínica especialista em Terapia Cognitivo-Comportamental.',
      phone: '(19) 98827-5290',
      availabilities: {
        create: [
          // Segunda
          { dayOfWeek: 1, startTime: 420, endTime: 690 }, // 07:00 - 11:30
          { dayOfWeek: 1, startTime: 870, endTime: 1050 }, // 14:30 - 17:30
          // Terça
          { dayOfWeek: 2, startTime: 420, endTime: 690 },
          { dayOfWeek: 2, startTime: 870, endTime: 1050 },
          // Quarta
          { dayOfWeek: 3, startTime: 420, endTime: 690 },
          { dayOfWeek: 3, startTime: 870, endTime: 1050 },
          // Quinta
          { dayOfWeek: 4, startTime: 420, endTime: 690 },
          { dayOfWeek: 4, startTime: 870, endTime: 1050 },
          // Sexta
          { dayOfWeek: 5, startTime: 420, endTime: 690 },
          { dayOfWeek: 5, startTime: 870, endTime: 1050 },
        ]
      }
    }
  })

  console.log('--- ADMIN CRIADO: cliseideangelini@gmail.com / admin123 ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
