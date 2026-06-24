import { NextResponse } from 'next/server';
import { PrismaClient, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const psychologist = await prisma.psychologist.findFirst();
    if (!psychologist) {
      return NextResponse.json({ error: 'Nenhuma psicóloga encontrada.' }, { status: 400 });
    }

    const patientsData = [
      { name: 'João Silva', email: 'joao.silva@exemplo.com', phone: '5511999990001' },
      { name: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', phone: '5511999990002' },
      { name: 'Carlos Santos', email: 'carlos.santos@exemplo.com', phone: '5511999990003' },
      { name: 'Ana Souza', email: 'ana.souza@exemplo.com', phone: '5511999990004' },
      { name: 'Pedro Alves', email: 'pedro.alves@exemplo.com', phone: '5511999990005' },
      { name: 'Beatriz Costa', email: 'beatriz.costa@exemplo.com', phone: '5511999990006' },
      { name: 'Fernanda Lima', email: 'fernanda.lima@exemplo.com', phone: '5511999990007' },
      { name: 'Ricardo Gomes', email: 'ricardo.gomes@exemplo.com', phone: '5511999990008' },
      { name: 'Juliana Paes', email: 'juliana.paes@exemplo.com', phone: '5511999990009' },
      { name: 'Marcos Vinicius', email: 'marcos.vinicius@exemplo.com', phone: '5511999990010' },
      { name: 'Camila Pitanga', email: 'camila.pitanga@exemplo.com', phone: '5511999990011' },
      { name: 'Daniel Alves', email: 'daniel.alves@exemplo.com', phone: '5511999990012' },
      { name: 'Vanessa Camargo', email: 'vanessa.camargo@exemplo.com', phone: '5511999990013' }
    ];

    const patients = [];
    const defaultPassword = await bcrypt.hash('senha123', 10);

    for (const p of patientsData) {
      const existing = await prisma.patient.findUnique({ where: { phone: p.phone } });
      if (!existing) {
        const created = await prisma.patient.create({
          data: { ...p, password: defaultPassword },
        });
        patients.push(created);
      } else {
        patients.push(existing);
      }
    }

    const now = new Date();
    const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const types: AppointmentType[] = ['ONLINE', 'PRESENTIAL', 'RETORNO', 'SUPERVISAO'];

    for (let i = 0; i < 40; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const daysToAdd = Math.floor(Math.random() * 14) - 2; // -2 to 12 days
      const hour = Math.floor(Math.random() * (18 - 8 + 1)) + 8;
      const minutes = Math.random() > 0.5 ? 0 : 30;

      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, hour, minutes, 0);
      const endDate = new Date(startDate.getTime() + 30 * 60000);

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

    const fixedPatient = patients[0];
    if (!fixedPatient.isFixed) {
        await prisma.patient.update({
            where: { id: fixedPatient.id },
            data: { isFixed: true, fixedDayOfWeek: 2, fixedTime: '15:00' }
        });
    }

    return NextResponse.json({ message: 'Seed concluído com sucesso! 40 agendamentos e 13 pacientes criados.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
