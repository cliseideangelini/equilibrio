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

    // Clean up old data
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});

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
      const created = await prisma.patient.create({
        data: { ...p, password: defaultPassword },
      });
      patients.push(created);
    }

    const now = new Date();
    const types: AppointmentType[] = ['ONLINE', 'PRESENCIAL'];
    
    // Config: 60 appointments spread across days
    for (let i = 0; i < 60; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      
      // -5 days to +10 days (allows past, today, and future)
      const daysToAdd = Math.floor(Math.random() * 16) - 5; 
      
      // We will only use hours: 8, 9, 10, 11, 14, 15, 16, 17, 18
      // This guarantees gaps, as there are many possible hours and we won't fill them all
      const possibleHours = [8, 9, 10, 11, 14, 15, 16, 17, 18];
      const hour = possibleHours[Math.floor(Math.random() * possibleHours.length)];
      const minutes = 0; // Keeping it on the dot for cleaner look

      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, hour, minutes, 0);
      const endDate = new Date(startDate.getTime() + 50 * 60000); // 50 mins session

      const type = types[Math.floor(Math.random() * types.length)];
      
      let status: AppointmentStatus;
      if (startDate < now) {
        // Passado: COMPLETED (70%), ABSENT (20%), CANCELLED (10%)
        const rand = Math.random();
        if (rand < 0.7) status = 'COMPLETED';
        else if (rand < 0.9) status = 'ABSENT';
        else status = 'CANCELLED';
      } else {
        // Futuro: PENDING (50%), CONFIRMED (40%), CANCELLED (10%)
        const rand = Math.random();
        if (rand < 0.5) status = 'PENDING';
        else if (rand < 0.9) status = 'CONFIRMED';
        else status = 'CANCELLED';
      }

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

    return NextResponse.json({ message: 'Nova simulação realista (60 agendamentos) concluída com sucesso!' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
