"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

export async function getPsychologistAvailability() {
    const psychologist = await prisma.psychologist.findFirst({
        where: { email: 'cliseideangelini@gmail.com' },
        include: { availabilities: true }
    });
    return psychologist?.availabilities || [];
}

export async function getAvailableSlots(dateString: string) {
    const date = new Date(dateString);
    const dayOfWeek = getDay(date);
    const now = new Date();

    // 1. Regra de Janela de 15 Dias
    const today = startOfDay(new Date());
    const maxDate = endOfDay(addMinutes(addMinutes(today, 15 * 24 * 60), -1)); // 15 dias
    if (isBefore(date, today) || isAfter(date, maxDate)) return [];
    if (dayOfWeek === 0 || dayOfWeek === 6) return []; // Ocultar finais de semana

    const availabilities = await prisma.availability.findMany({
        where: {
            dayOfWeek,
            psychologist: { email: 'cliseideangelini@gmail.com' }
        }
    });

    if (availabilities.length === 0) return [];

    // 2. Buscar pacientes fixos para este dia da semana
    const fixedPatients = await prisma.patient.findMany({
        where: { isFixed: true, fixedDayOfWeek: dayOfWeek, deletedAt: null }
    });
    const fixedTimes = fixedPatients.map(p => p.fixedTime);

    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDay(date),
                lte: endOfDay(date),
            },
            status: { not: 'CANCELLED' },
            deletedAt: null
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

                if (!isOccupied && !fixedTimes.includes(format(slotStart, 'HH:mm'))) {
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
    username?: string;
    dateOfBirth?: string;
    password?: string;
    date: string;
    time: string;
    type: "ONLINE" | "PRESENCIAL";
}) {
    const { name, email, phone, username, dateOfBirth, password, date, time, type } = formData;

    // Encontrar paciente pelo TELEFONE
    let patient: any = await prisma.patient.findFirst({
        where: { phone, deletedAt: null }
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
                username: username || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
        where: { email: 'cliseideangelini@gmail.com' }
    });

    if (!psychologist) return { success: false, error: "Psicóloga não encontrada no sistema. Verifique o cadastro." };

    const [hours, mins] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, mins, 0, 0);
    const endTime = addMinutes(startTime, 30);

    const meetLink = type === "ONLINE" ? "https://meet.google.com/wnx-geqg-wgs" : null;

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
        where: { phone, deletedAt: null }
    });

    if (!patient || !patient.password) {
        return { success: false, error: "Usuário não encontrado ou sem senha cadastrada." };
    }

    const isValid = await bcrypt.compare(password, patient.password);
    if (!isValid) return { success: false, error: "Senha incorreta." };

    const cookieStore = await cookies();
    cookieStore.set("patient_id", patient.id, { httpOnly: true, secure: true, sameSite: "strict" });

    return {
        success: true,
        patientId: patient.id,
        name: patient.name,
        mustChangePassword: patient.mustChangePassword
    };
}

export async function loginPsychologist(identifier: string, password: string) {
    const psychologist = await prisma.psychologist.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if (!psychologist) {
        return { success: false, error: "Usuário ou senha inválidos." };
    }

    const isValid = await bcrypt.compare(password, psychologist.password);
    if (!isValid) return { success: false, error: "Usuário ou senha inválidos." };

    const cookieStore = await cookies();
    cookieStore.set("admin_id", psychologist.id, { httpOnly: true, secure: true, sameSite: "strict" });

    return {
        success: true,
        adminId: psychologist.id,
        name: psychologist.name
    };
}

export async function forgotPassword(email: string, type: "PATIENT" | "PSYCHOLOGIST") {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000); // 1 hora

    if (type === "PSYCHOLOGIST") {
        const user = await prisma.psychologist.findUnique({ where: { email } });
        if (!user) return { success: false, error: "Usuário não encontrado." };
        await prisma.psychologist.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });
    } else {
        const user = await prisma.patient.findUnique({ where: { email } });
        if (!user) return { success: false, error: "Usuário não encontrado." };
        await prisma.patient.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });
    }

    // Simulação de envio de e-mail
    console.log(`[EMAIL] Link de recuperação para ${email}: https://equilibrio-psi.vercel.app/recuperar-senha?token=${token}`);
    
    return { success: true, message: "E-mail de recuperação enviado." };
}

export async function resetPassword(token: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Tentar no Psicólogo
    const psychologist = await prisma.psychologist.findFirst({
        where: { resetToken: token, resetTokenExpiry: { gte: new Date() } }
    });

    if (psychologist) {
        await prisma.psychologist.update({
            where: { id: psychologist.id },
            data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
        });
        return { success: true };
    }

    // Tentar no Paciente
    const patient = await prisma.patient.findFirst({
        where: { resetToken: token, resetTokenExpiry: { gte: new Date() } }
    });

    if (patient) {
        await prisma.patient.update({
            where: { id: patient.id },
            data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
        });
        return { success: true };
    }

    return { success: false, error: "Token inválido ou expirado." };
}



// --- LISTA DE ESPERA ---

export async function addToWaitingList(data: {
    name: string;
    phone: string;
    email?: string;
    preferredDays?: string;
    preferredShift?: "MANHA" | "TARDE";
    specificDate?: Date;
    specificTime?: string;
}) {
    await prisma.waitingList.create({
        data: {
            ...data,
            status: "PENDING"
        }
    });

    revalidatePath('/area-clinica/lista-espera');
    return { success: true };
}

export async function getWaitingList() {
    return await prisma.waitingList.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateWaitingListStatus(id: string, status: string) {
    await prisma.waitingList.update({
        where: { id },
        data: { status }
    });
    revalidatePath('/area-clinica/lista-espera');
    return { success: true };
}

export async function deleteWaitingListEntry(id: string) {
    await prisma.waitingList.delete({
        where: { id }
    });
    revalidatePath('/area-clinica/lista-espera');
    return { success: true };
}

export async function cancelAppointment(appointmentId: string, confirmLateCharge: boolean = false, isProfessional: boolean = false) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { psychologist: true, patient: true }
    });

    if (!appointment) throw new Error("Agendamento não encontrado");

    const now = new Date();
    const hoursUntilSession = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Se for o profissional cancelando, não tem regra de 3h, mas dispara notificação pro paciente
    if (!isProfessional && hoursUntilSession <= 3 && !confirmLateCharge) {
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

    if (isProfessional) {
        // Gatilho de notificação para o paciente (Simulado aqui, integrar com API de WhatsApp)
        console.log(`NOTIFICAÇÃO: Enviando aviso para o paciente ${appointment.patient.name} (${appointment.patient.phone}) sobre cancelamento pela profissional.`);
        // Ex: sendWhatsApp(appointment.patient.phone, `Olá ${appointment.patient.name}, infelizmente a Dra. Cliseide precisou desmarcar seu horário de ${format(appointment.startTime, "dd/MM 'às' HH:mm")}. Entre em contato para reagendarmos.`);
    }

    // Lógica de Lista de Espera: Notificar interessados
    try {
        const timeStr = format(appointment.startTime, 'HH:mm');
        const startTimeStr = format(appointment.startTime, 'yyyy-MM-dd');
        
        // 1. Prioridade: Quem pediu ESSE horário específico
        const specificInterested = await (prisma as any).waitingList.findMany({
            where: {
                status: "PENDING",
                specificTime: timeStr,
                specificDate: {
                    gte: startOfDay(appointment.startTime),
                    lte: endOfDay(appointment.startTime)
                }
            }
        });

        // 2. Geral: Quem está na lista esperando qualquer vaga
        const generalInterested = await (prisma as any).waitingList.findMany({
            where: {
                status: "PENDING",
                specificDate: null
            }
        });

        const allToNotify = [...specificInterested, ...generalInterested];

        if (allToNotify.length > 0) {
            // Marcar como notificados
            await (prisma as any).waitingList.updateMany({
                where: { id: { in: allToNotify.map((i: any) => i.id) } },
                data: { status: "NOTIFIED" }
            });

            // Nota: Integrar com API de WhatsApp real aqui no futuro
            // Ex: sendWhatsApp(i.phone, `Vaga aberta! Agende agora: equilibrium.com/agendar?date=${startTimeStr}&time=${timeStr}`)
        }
    } catch (e) {
        console.error("Erro ao processar lista de espera:", e);
    }

    revalidatePath('/paciente/minha-agenda');
    revalidatePath('/area-clinica/lista-espera');
    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
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

export async function saveEvolution(patientId: string, appointmentId: string, content: string, date?: Date, isDraft: boolean = false) {
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
        update: {
            content,
            isDraft,
            date: date || undefined
        },
        create: {
            content,
            patientId,
            appointmentId,
            isDraft,
            date: date || new Date()
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
        where: { email: 'cliseideangelini@gmail.com' }
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

export async function updatePatientPassword(patientId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.patient.update({
        where: { id: patientId },
        data: {
            password: hashedPassword,
            mustChangePassword: false
        }
    });

    return { success: true };
}


export async function getPatientByPhone(phone: string) {
    return await prisma.patient.findFirst({
        where: { phone, deletedAt: null }
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_id');
    cookieStore.delete('patient_id');
    return { success: true };
}

export async function updatePatientProfile(data: { name: string, email: string, password?: string }) {
    const cookieStore = await cookies();
    const patientId = cookieStore.get('patient_id')?.value;
    if (!patientId) return { success: false, error: 'N�o autorizado' };

    const updateData: any = { name: data.name, email: data.email };
    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.patient.update({
        where: { id: patientId },
        data: updateData
    });

    revalidatePath('/paciente/minha-agenda');
    return { success: true };
}


export async function registerPatient(formData: {
    name: string;
    email?: string;
    phone: string;
    username: string;
    dateOfBirth: string;
    password?: string;
}) {
    const { name, email, phone, username, dateOfBirth, password } = formData;
    
    const existingPhone = await prisma.patient.findFirst({ where: { phone, deletedAt: null } });
    if (existingPhone) return { success: false, error: "Este WhatsApp já está cadastrado." };
    
    const existingUsername = await prisma.patient.findFirst({ where: { username, deletedAt: null } });
    if (existingUsername) return { success: false, error: "Este Nome de Usuário já está em uso." };

    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const patient = await prisma.patient.create({
        data: {
            name,
            email: email || null,
            phone,
            username,
            dateOfBirth: new Date(dateOfBirth),
            password: hashedPassword
        }
    });

    // Auto-login setting cookie
    const cookieStore = await cookies();
    cookieStore.set("patient_id", patient.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });

    return { success: true, patient };
}
