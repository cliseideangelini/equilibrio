"use server";

import prisma from "@/lib/prisma";
import {
    startOfDay,
    endOfDay,
    addMinutes,
    format,
    getDay,
    isBefore,
    isAfter,
    parseISO
} from "date-fns";


export async function getAvailableSlots(dateString: string) {
    const date = new Date(dateString);
    const dayOfWeek = getDay(date);

    // 1. Buscar a disponibilidade da Cliseide para este dia da semana
    const availability = await prisma.availability.findFirst({
        where: {
            dayOfWeek,
            psychologist: { email: 'cliseide@exemplo.com' }
        }
    });

    if (!availability) return [];

    // 2. Buscar agendamentos existentes para este dia
    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(date),
                lte: endOfDay(date),
            },
            status: { not: 'CANCELLED' }
        }
    });

    // 3. Gerar slots
    const slots = [];
    let currentMinutes = availability.startTime;
    const sessionDuration = 50;
    const buffer = 10;

    while (currentMinutes + sessionDuration <= availability.endTime) {
        const slotStart = addMinutes(startOfDay(date), currentMinutes);
        const slotEnd = addMinutes(slotStart, sessionDuration);

        // Verificar se este slot já está ocupado
        const isOccupied = appointments.some((app: any) => {
            const appStart = new Date(app.startTime);
            const appEnd = new Date(app.endTime);
            return (
                (isAfter(slotStart, appStart) && isBefore(slotStart, appEnd)) ||
                (isAfter(slotEnd, appStart) && isBefore(slotEnd, appEnd)) ||
                (format(slotStart, 'HH:mm') === format(appStart, 'HH:mm'))
            );
        });

        if (!isOccupied) {
            slots.push(format(slotStart, 'HH:mm'));
        }

        currentMinutes += (sessionDuration + buffer);
    }

    return slots;
}

export async function createAppointment(formData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
}) {
    const { name, email, phone, date, time } = formData;

    // Encontrar ou criar paciente
    const patient = await prisma.patient.upsert({
        where: { email },
        update: { name, phone },
        create: { name, email, phone },
    });

    // Encontrar psicóloga
    const psychologist = await prisma.psychologist.findFirst({
        where: { email: 'cliseide@exemplo.com' }
    });

    if (!psychologist) throw new Error("Psicóloga não encontrada");

    // Calcular horários
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addMinutes(startTime, 50);

    // Criar agendamento
    const appointment = await prisma.appointment.create({
        data: {
            startTime,
            endTime,
            psychologistId: psychologist.id,
            patientId: patient.id,
            status: 'PENDING'
        }
    });

    return { success: true, appointmentId: appointment.id };
}
