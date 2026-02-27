import { PrismaClient, AppointmentStatus, AppointmentType } from '@prisma/client'
import { addDays, subDays, startOfDay, addMinutes, format } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
    console.log('Iniciando seed de demonstração...')

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

    // Limpar dados anteriores (exceto psicóloga) para um recomeço limpo
    await prisma.evolution.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.attachment.deleteMany({})
    await prisma.patient.deleteMany({})
    await prisma.availability.deleteMany({ where: { psychologistId: cliseide.id } })

    // 1. Recriar disponibilidades
    const weekDays = [1, 2, 3, 4, 5]
    for (const day of weekDays) {
        // Manhã
        await prisma.availability.create({
            data: { dayOfWeek: day, startTime: 480, endTime: 720, psychologistId: cliseide.id } // 08:00 - 12:00
        })
        // Tarde
        await prisma.availability.create({
            data: { dayOfWeek: day, startTime: 840, endTime: 1140, psychologistId: cliseide.id } // 14:00 - 19:00
        })
    }

    const patientNames = [
        "Ana Silva", "Bruno Oliveira", "Carla Santos", "Diego Lima", "Elena Costa",
        "Fabio Pereira", "Gisele Rocha", "Hugo Almeida", "Isabela Martins", "João Ferreira",
        "Karina Souza", "Lucas Gomes", "Mariana Barbosa", "Nicolas Castro", "Olivia Pinto",
        "Paulo Ribeiro", "Quiteria Mendes", "Rafael Xavier", "Sara Cardoso", "Tiago Moraes",
        "Ursula Ramos", "Vitor Teixeira", "Wagner Machado", "Ximena Dias", "Yago Carvalho"
    ]

    const evolutionTexts = [
        "Paciente apresenta melhora significativa na ansiedade. Relata ter conseguido aplicar as técnicas de respiração durante a semana.",
        "Sessão focada em luto. Paciente expressou sentimentos de tristeza profunda, mas começa a aceitar a nova realidade.",
        "Trabalhamos questões de autoestima e limites no trabalho. Paciente identificou padrões de comportamento repetitivos.",
        "Paciente relatou conflito familiar. Discutimos estratégias de comunicação assertiva para a próxima reunião de família.",
        "Primeira sessão. Coleta de anamnese e estabelecimento do contrato terapêutico. Paciente motivado para o processo.",
        "Focamos em técnicas de TCC para lidar com pensamentos intrusivos. Houve boa aderência às tarefas de casa.",
        "Paciente trouxe demanda sobre transição de carreira. Analisamos prós e contras e sentimentos de insegurança.",
        "Sessão lúdica (infantil). Através do desenho, a criança expressou medos relacionados à escola."
    ]

    console.log(`Gerando ${patientNames.length} pacientes...`)

    const statuses: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "ABSENT", "CANCELLED"]
    const types: AppointmentType[] = ["ONLINE", "PRESENCIAL"]

    for (let i = 0; i < patientNames.length; i++) {
        const name = patientNames[i]
        const phone = `19 9${Math.floor(10000000 + Math.random() * 90000000)}`

        const patient = await prisma.patient.create({
            data: {
                name,
                phone,
                email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
            }
        })

        // -- Consultas Passadas (2 a 4 por paciente) --
        const pastCount = 2 + Math.floor(Math.random() * 3)
        for (let j = 1; j <= pastCount; j++) {
            const date = subDays(new Date(), j * 7 + Math.floor(Math.random() * 6))
            date.setHours(8 + Math.floor(Math.random() * 10), 0, 0, 0)

            const app = await prisma.appointment.create({
                data: {
                    startTime: date,
                    endTime: addMinutes(date, 30),
                    psychologistId: cliseide.id,
                    patientId: patient.id,
                    status: "COMPLETED",
                    type: types[Math.floor(Math.random() * types.length)]
                }
            })

            // Adicionar Evolução para as completadas
            await prisma.evolution.create({
                data: {
                    content: evolutionTexts[Math.floor(Math.random() * evolutionTexts.length)],
                    patientId: patient.id,
                    appointmentId: app.id
                }
            })

            // Pagamento
            await prisma.payment.create({
                data: {
                    amount: 150.0,
                    status: "PAID",
                    method: "PIX",
                    appointmentId: app.id,
                    paidAt: date
                }
            })
        }

        // -- Consulta para Hoje (Para cerca de 15 pacientes) --
        if (i < 15) {
            const today = new Date()
            const hour = 8 + (i % 10)
            const minutes = (i > 10) ? 30 : 0
            const start = startOfDay(today)
            start.setHours(hour, minutes, 0, 0)

            // Variar status para demonstrar o painel
            let status: AppointmentStatus = "CONFIRMED"
            if (i === 0) status = "PENDING"
            if (i === 1) status = "ABSENT"
            if (i === 2) status = "CANCELLED"
            if (i === 3) status = "COMPLETED"

            await prisma.appointment.create({
                data: {
                    startTime: start,
                    endTime: addMinutes(start, 30),
                    psychologistId: cliseide.id,
                    patientId: patient.id,
                    status: status,
                    type: i % 2 === 0 ? "ONLINE" : "PRESENCIAL",
                    meetLink: i % 2 === 0 ? "https://meet.google.com/abc-defg-hij" : null
                }
            })
        }

        // -- Consulta Futura (Para todos) --
        const futureDate = addDays(new Date(), 7 + (i % 14))
        futureDate.setHours(9 + (i % 8), 0, 0, 0)

        await prisma.appointment.create({
            data: {
                startTime: futureDate,
                endTime: addMinutes(futureDate, 30),
                psychologistId: cliseide.id,
                patientId: patient.id,
                status: "CONFIRMED",
                type: types[Math.floor(Math.random() * types.length)]
            }
        })
    }

    console.log('Seed de demonstração concluído com sucesso!')
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
