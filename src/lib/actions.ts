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
    parseISO,
    subDays,
    setHours,
    setMinutes
} from "date-fns";
import { AppointmentType } from "@prisma/client";

export async function getAvailableSlots(dateString: string) {
    const date = new Date(dateString);
    const dayOfWeek = getDay(date);
    const now = new Date();

    // 1. Buscar as disponibilidades da Cliseide para este dia da semana (pode ter manhã e tarde)
    const availabilities = await prisma.availability.findMany({
        where: {
            dayOfWeek,
            psychologist: { email: 'crisangelini.silva@gmail.com' }
        }
    });

    if (availabilities.length === 0) return [];

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

    // 3. Gerar slots para cada bloco de disponibilidade
    const slots = [];
    const sessionDuration = 30;
    const buffer = 0;

    for (const availability of availabilities) {
        let currentMinutes = availability.startTime;

        while (currentMinutes + sessionDuration <= availability.endTime) {
            const slotStart = addMinutes(startOfDay(date), currentMinutes);
            const slotEnd = addMinutes(slotStart, sessionDuration);

            // Regras de Antecedência:
            let isWithinDeadline = true;

            // Horários da manhã (7:00 até 11:30): até as 21:00 do dia anterior
            if (currentMinutes < 870) { // Antes das 14:30
                const deadline = setMinutes(setHours(subDays(startOfDay(date), 0), 21), 0);
                // Espera... "dia anterior" significa subDays(date, 1)
                const realDeadline = addMinutes(subDays(startOfDay(date), 1), 21 * 60);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }
            // Horários de 14:30: 2 horas de antecedência
            else if (currentMinutes >= 870 && currentMinutes < 900) { // Bloco das 14:30
                const realDeadline = addMinutes(slotStart, -120);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }
            // Demais horários (se houver): 30 minutos
            else {
                const realDeadline = addMinutes(slotStart, -30);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }

            if (isWithinDeadline) {
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
            }

            currentMinutes += (sessionDuration + buffer);
        }
    }

    return slots.sort();
}

export async function createAppointment(formData: {
    name: string;
    email?: string;
    phone: string;
    date: string;
    time: string;
    type: "ONLINE" | "PRESENCIAL";
}) {
    const { name, email, phone, date, time, type } = formData;

    // Encontrar ou criar paciente pelo TELEFONE (que é o obrigatório agora)
    // Mas o Upsert do Prisma exige um campo @unique. Vamos usar o telefone como identificador?
    // Melhor manter o fluxo, mas o email pode ser nulo.
    let patient = await prisma.patient.findFirst({
        where: { phone }
    });

    if (!patient) {
        patient = await prisma.patient.create({
            data: { name, email, phone }
        });
    } else {
        await prisma.patient.update({
            where: { id: patient.id },
            data: { name, email }
        });
    }

    // Encontrar psicóloga
    const psychologist = await prisma.psychologist.findFirst({
        where: { email: 'crisangelini.silva@gmail.com' }
    });

    if (!psychologist) throw new Error("Psicóloga não encontrada");

    // Calcular horários
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addMinutes(startTime, 30);

    // Criar agendamento
    const appointment = await prisma.appointment.create({
        data: {
            startTime,
            endTime,
            psychologistId: psychologist.id,
            patientId: patient.id,
            status: 'PENDING',
            type: type as AppointmentType
        }
    });

    return { success: true, appointmentId: appointment.id };
}
