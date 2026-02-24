const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
    console.log('--- Iniciando limpeza do banco de dados ---');

    // Deleta os pagamentos primeiro por causa das Foreign Keys
    const payments = await prisma.payment.deleteMany({});
    console.log(`- ${payments.count} pagamentos removidos.`);

    // Deleta os agendamentos
    const appointments = await prisma.appointment.deleteMany({});
    console.log(`- ${appointments.count} agendamentos removidos.`);

    // Deleta os pacientes
    const patients = await prisma.patient.deleteMany({});
    console.log(`- ${patients.count} pacientes removidos.`);

    console.log('--- Banco de dados limpo com sucesso! ---');
}

reset()
    .catch((e) => {
        console.error('Erro ao limpar banco:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
