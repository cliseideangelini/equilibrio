import { PrismaClient, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando geração de dados de teste (Seed)...');

  const psychologist = await prisma.psychologist.findFirst();
  if (!psychologist) {
    console.error('❌ Nenhuma psicóloga encontrada. Impossível criar agendamentos.');
    return;
  }

  // 1. Criar pacientes
  const patientsData = [
    { name: 'João Silva', email: 'joao.silva@exemplo.com', phone: '5511999990001' },
    { name: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', phone: '5511999990002' },
    { name: 'Carlos Santos', email: 'carlos.santos@exemplo.com', phone: '5511999990003' },
    { name: 'Ana Souza', email: 'ana.souza@exemplo.com', phone: '5511999990004' },
    { name: 'Pedro Alves', email: 'pedro.alves@exemplo.com', phone: '5511999990005' },
    { name: 'Beatriz Costa', email: 'beatriz.costa@exemplo.com', phone: '5511999990006' },
  ];

  const patients = [];
  const defaultPassword = await bcrypt.hash('senha123', 10);

  console.log('Criando pacientes...');
  for (const p of patientsData) {
    const existing = await prisma.patient.findUnique({ where: { phone: p.phone } });
    if (!existing) {
      const created = await prisma.patient.create({
        data: {
          ...p,
          password: defaultPassword,
        },
      });
      patients.push(created);
    } else {
      patients.push(existing);
    }
  }

  // 2. Criar agendamentos (vários dias e horários a partir de hoje)
  const now = new Date();
  
  // Vamos criar para hoje e para os próximos 7 dias
  console.log('Criando agendamentos...');
  
  const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const types: AppointmentType[] = ['ONLINE', 'PRESENTIAL', 'RETORNO', 'SUPERVISAO'];

  for (let i = 0; i < 20; i++) {
    // Escolher um paciente aleatório
    const patient = patients[Math.floor(Math.random() * patients.length)];
    
    // Dia aleatório (de 0 a 7 dias a partir de hoje)
    const daysToAdd = Math.floor(Math.random() * 8);
    // Hora aleatória entre 8h e 18h
    const hour = Math.floor(Math.random() * (18 - 8 + 1)) + 8;
    // Minuto (00 ou 30)
    const minutes = Math.random() > 0.5 ? 0 : 30;

    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, hour, minutes, 0);
    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutos depois

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    await prisma.appointment.create({
      data: {
        startTime: startDate,
        endTime: endDate,
        status: status,
        type: type,
        psychologistId: psychologist.id,
        patientId: patient.id,
      },
    });
  }

  console.log('✅ 20 agendamentos fictícios criados com sucesso.');

  // 3. Criar pacientes fixos na agenda (IsFixed = true)
  const fixedPatient = patients[0];
  if (!fixedPatient.isFixed) {
      await prisma.patient.update({
          where: { id: fixedPatient.id },
          data: {
              isFixed: true,
              fixedDayOfWeek: 2, // Terça-feira
              fixedTime: '15:00'
          }
      });
      console.log('✅ Paciente fixo configurado (Terça às 15:00).');
  }

  console.log('🚀 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
