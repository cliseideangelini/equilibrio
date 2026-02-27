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

    // 1. Recriar disponibilidades (agenda real da Dra.)
    // Segunda (1): apenas tarde 14:30-17:30
    await prisma.availability.create({
        data: { dayOfWeek: 1, startTime: 870, endTime: 1050, psychologistId: cliseide.id } // 14:30 - 17:30
    })

    // Terça a Sexta (2-5): manhã 07:00-11:30 + tarde 14:30-17:30
    for (const day of [2, 3, 4, 5]) {
        await prisma.availability.create({
            data: { dayOfWeek: day, startTime: 420, endTime: 690, psychologistId: cliseide.id } // 07:00 - 11:30
        })
        await prisma.availability.create({
            data: { dayOfWeek: day, startTime: 870, endTime: 1050, psychologistId: cliseide.id } // 14:30 - 17:30
        })
    }

    const patientNames = [
        "Ana Silva", "Bruno Oliveira", "Carla Santos", "Diego Lima", "Elena Costa",
        "Fabio Pereira", "Gisele Rocha", "Hugo Almeida", "Isabela Martins", "João Ferreira",
        "Karina Souza", "Lucas Gomes", "Mariana Barbosa", "Nicolas Castro", "Olivia Pinto",
        "Paulo Ribeiro", "Quiteria Mendes", "Rafael Xavier", "Sara Cardoso", "Tiago Moraes",
        "Ursula Ramos", "Vitor Teixeira", "Wagner Machado", "Ximena Dias", "Yago Carvalho",
        "Zeca Pagodinho", "Antonio Fagundes", "Beatriz Segall", "Caetano Veloso", "Dulce Rosalina",
        "Erasmo Carlos", "Fernanda Montenegro", "Gilberto Gil", "Heloisa Perisse", "Iris Bruzzi",
        "Jorge Amado", "Katia Abreu", "Lulu Santos", "Milton Nascimento", "Nara Leão",
        "Oswaldo Montenegro", "Patricia Pillar", "Quincas Borba", "Regina Duarte", "Selton Mello",
        "Tarcisio Meira", "Ulysses Guimarães", "Vera Fischer", "Wilson Simonal", "Zezé Motta"
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
        const phone = `11 9${Math.floor(10000000 + Math.random() * 90000000)}`

        const patient = await prisma.patient.create({
            data: {
                name,
                phone,
                email: `${name.toLowerCase().replace(/\s/g, '.')}@email.com`,
            }
        })

        // -- Consultas em um intervalo de 30 dias (15 passados, 15 futuros) --
        for (let d = -15; d <= 15; d++) {
            // Chance de ter consulta neste dia (20%)
            if (Math.random() > 0.8) {
                const date = addDays(new Date(), d)
                // Pular fins de semana no seed para ser mais realista
                const dayOfWeek = date.getDay()
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;

                date.setHours(8 + Math.floor(Math.random() * 10), Math.random() > 0.5 ? 30 : 0, 0, 0)

                let status: AppointmentStatus = "CONFIRMED"
                if (d < 0) status = Math.random() > 0.2 ? "COMPLETED" : (Math.random() > 0.5 ? "ABSENT" : "CANCELLED")
                else if (d === 0) {
                    const rand = Math.random()
                    status = rand > 0.7 ? "CONFIRMED" : (rand > 0.4 ? "PENDING" : (rand > 0.2 ? "COMPLETED" : "ABSENT"))
                } else {
                    status = Math.random() > 0.3 ? "CONFIRMED" : "PENDING"
                }

                const app = await prisma.appointment.create({
                    data: {
                        startTime: date,
                        endTime: addMinutes(date, 30),
                        psychologistId: cliseide.id,
                        patientId: patient.id,
                        status: status,
                        type: types[Math.floor(Math.random() * types.length)],
                        meetLink: Math.random() > 0.5 ? "https://meet.google.com/abc-defg-hij" : null
                    }
                })

                if (status === "COMPLETED") {
                    await prisma.evolution.create({
                        data: {
                            content: evolutionTexts[Math.floor(Math.random() * evolutionTexts.length)],
                            patientId: patient.id,
                            appointmentId: app.id
                        }
                    })
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
            }
        }
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
