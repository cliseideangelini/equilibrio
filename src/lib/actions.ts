"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";
import {
    startOfDay,
    endOfDay,
    addMinutes,
    format,
    getDay,
    isBefore,
    isAfter,
    setHours,
    setMinutes,
    subDays
} from "date-fns";

export async function getAvailableSlots(dateString: string) {
    const date = new Date(dateString);
    const dayOfWeek = getDay(date);
    const now = new Date();

    const availabilities = await prisma.availability.findMany({
        where: {
            dayOfWeek,
            psychologist: { email: 'Cliseideangelini@gmail.com' }
        }
    });

    if (availabilities.length === 0) return [];

    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(date),
                lte: endOfDay(date),
            },
            status: { not: 'CANCELLED' }
        }
    });

    const slots = [];
    const sessionDuration = 30;
    const buffer = 0;

    for (const availability of availabilities) {
        let currentMinutes = availability.startTime;

        while (currentMinutes + sessionDuration <= availability.endTime) {
            const slotStart = addMinutes(startOfDay(date), currentMinutes);
            const slotEnd = addMinutes(slotStart, sessionDuration);

            let isWithinDeadline = true;

            if (currentMinutes < 870) {
                const realDeadline = addMinutes(subDays(startOfDay(date), 1), 21 * 60);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }
            else if (currentMinutes >= 870 && currentMinutes < 900) {
                const realDeadline = addMinutes(slotStart, -120);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }
            else {
                const realDeadline = addMinutes(slotStart, -30);
                if (isAfter(now, realDeadline)) isWithinDeadline = false;
            }

            if (isWithinDeadline) {
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
    password?: string;
    date: string;
    time: string;
    type: "ONLINE" | "PRESENCIAL";
}) {
    const { name, email, phone, password, date, time, type } = formData;

    // Encontrar paciente pelo TELEFONE
    let patient: any = await prisma.patient.findFirst({
        where: { phone }
    });

    const cookieStore = await cookies();
    const isOwner = patient && cookieStore.get("patient_id")?.value === patient.id;

    if (patient && patient.password && !password && !isOwner) {
        return { success: false, error: "Este telefone já possui cadastro. Por favor, faça login preenchendo sua senha para agendar." };
    }

    let hashedPassword: string | undefined = undefined;
    if (password && password !== "SESSION_ACTIVE") {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    if (!patient) {
        patient = await prisma.patient.create({
            data: {
                name,
                email: email || null,
                phone,
                password: hashedPassword
            }
        });
    } else {
        const updateData: any = { name };
        if (email) updateData.email = email;
        if (hashedPassword) updateData.password = hashedPassword;

        await prisma.patient.update({
            where: { id: patient.id },
            data: updateData
        });
    }

    const psychologist = await prisma.psychologist.findFirst({
        where: { email: 'Cliseideangelini@gmail.com' }
    });

    if (!psychologist) return { success: false, error: "Psicóloga não encontrada no sistema. Verifique o cadastro." };

    const [hours, mins] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, mins, 0, 0);
    const endTime = addMinutes(startTime, 30);

    // Google Calendar — Tentativa de criação dinâmica (opcional)
    let meetLink: string | null = "https://meet.google.com/wnx-geqg-wgs";

    try {
        const result = await createGoogleCalendarEvent({
            patientName: name,
            startTime,
            durationMinutes: 30,
            type: type as "ONLINE" | "PRESENCIAL"
        });
        if (result.meetLink) meetLink = result.meetLink;
    } catch (err: any) {
        // Falha silenciosa, usaremos o link fixo padrão definido acima
    }

    // Se for presencial, não salva link
    if (type !== "ONLINE") meetLink = null;

    const appointment = await prisma.appointment.create({
        data: {
            startTime,
            endTime,
            psychologistId: psychologist.id,
            patientId: patient.id,
            status: "PENDING",
            type: type as any,
            meetLink,
        }
    });

    revalidatePath('/paciente/minha-agenda');
    return { success: true, appointmentId: appointment.id, meetLink };
}

export async function loginPatient(phone: string, password: string) {
    const patient: any = await prisma.patient.findUnique({
        where: { phone }
    });

    if (!patient || !patient.password) {
        return { success: false, error: "Usuário não encontrado ou sem senha cadastrada." };
    }

    const isValid = await bcrypt.compare(password, patient.password);
    if (!isValid) return { success: false, error: "Senha incorreta." };

    return { success: true, patientId: patient.id, name: patient.name };
}

export async function registerPatient(formData: { name: string, phone: string, password: string, email?: string }) {
    const existing: any = await prisma.patient.findUnique({ where: { phone: formData.phone } });
    if (existing && existing.password) throw new Error("Este telefone já possui cadastro.");

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const patient = existing
        ? await prisma.patient.update({
            where: { id: existing.id },
            data: { password: hashedPassword, name: formData.name, email: formData.email }
        })
        : await prisma.patient.create({
            data: { ...formData, password: hashedPassword }
        });

    revalidatePath("/area-clinica/pacientes");
    return { success: true, patientId: (patient as any).id };
}

export async function cancelAppointment(appointmentId: string, confirmLateCharge: boolean = false) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { psychologist: true }
    });

    if (!appointment) throw new Error("Agendamento não encontrado");

    const now = new Date();
    const hoursUntilSession = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession <= 3 && !confirmLateCharge) {
        return {
            success: false,
            requiresConfirmation: true,
            message: "Atenção: Cancelamentos com menos de 3h de antecedência serão cobrados integralmente. Deseja prosseguir?"
        };
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" }
    });

    revalidatePath('/paciente/minha-agenda');
    return { success: true };
}

export async function confirmAppointment(id: string) {
    const app = await prisma.appointment.update({
        where: { id },
        data: { status: "CONFIRMED" },
        select: { patientId: true }
    });

    revalidatePath('/area-clinica');
    return { success: true, patientId: app.patientId };
}

export async function setAbsent(id: string) {
    await prisma.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.ABSENT }
    });

    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
    return { success: true };
}

export async function completeAppointment(id: string) {
    await prisma.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.COMPLETED }
    });

    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
    return { success: true };
}

export async function saveEvolution(patientId: string, appointmentId: string, content: string) {
    if (!content.trim()) {
        try {
            await prisma.evolution.delete({
                where: { appointmentId }
            });
        } catch (e) {
            // Ignore if it doesn't exist
        }
        revalidatePath(`/area-clinica/prontuarios/${patientId}`);
        return { success: true };
    }

    const evolution = await prisma.evolution.upsert({
        where: { appointmentId },
        update: { content },
        create: {
            content,
            patientId,
            appointmentId
        }
    });

    revalidatePath(`/area-clinica/prontuarios/${patientId}`);
    return { success: true, evolutionId: evolution.id };
}

export async function addAttachment(patientId: string, name: string, url: string, type: string) {
    const attachment = await prisma.attachment.create({
        data: {
            name,
            url,
            type,
            patientId
        }
    });

    revalidatePath(`/area-clinica/prontuarios/${patientId}`);
    return { success: true, attachmentId: attachment.id };
}

export async function createManualAppointment(data: {
    patientId: string;
    date: Date;
    type: "ONLINE" | "PRESENCIAL";
    meetLink?: string;
}) {
    const psychologist = await prisma.psychologist.findFirst({
        where: { email: 'Cliseideangelini@gmail.com' }
    });

    if (!psychologist) throw new Error("Psicóloga não encontrada");

    const startTime = new Date(data.date);
    const endTime = addMinutes(startTime, 30);

    const appointment = await prisma.appointment.create({
        data: {
            startTime,
            endTime,
            psychologistId: psychologist.id,
            patientId: data.patientId,
            status: "CONFIRMED", // Agendamentos manuais já nascem confirmados
            type: data.type,
            meetLink: data.type === "ONLINE" ? (data.meetLink || "https://meet.google.com/wnx-geqg-wgs") : null,
        }
    });

    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
    return { success: true, appointmentId: appointment.id };
}
