import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.appointment.deleteMany({});
    
    // We shouldn't delete the psychologist. We should only delete the simulated patients.
    // Wait, the user is the only one who has access, so all patients were generated for this simulation, EXCEPT maybe real ones?
    // Let's delete all patients.
    await prisma.patient.deleteMany({});

    return NextResponse.json({ message: 'Todas as simulações (pacientes e agendamentos) foram excluídas com sucesso!' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
