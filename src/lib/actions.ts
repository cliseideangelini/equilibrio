"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { notifyPsychologist, formatAppointmentDetailsForWhatsApp, notifyPatient, formatDateTimeSimple } from "@/lib/whatsapp";

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
import { getLocalNow } from "@/lib/utils";

export async function getPsychologistAvailability() {
    const psychologist = await prisma.psychologist.findFirst({
        include: { availabilities: true }
    });
    return psychologist?.availabilities || [];
}

export async function getAvailableSlots(dateString: string) {

    const dateClean = dateString.substring(0, 10);
    const dayOfWeek = new Date(`${dateClean}T12:00:00Z`).getUTCDay();
    const now = new Date(); // Standard actual UTC now

    // 1. Regra de Quinzena (Dia 01 a 15, ou Dia 16 a 30/31)
    const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);
    
    const todayStart = new Date(`${todayStr}T00:00:00-03:00`);
    
    // Determinar limites da quinzena baseados na data local de São Paulo
    const localDay = parseInt(todayStr.split("-")[2], 10);
    const localMonth = parseInt(todayStr.split("-")[1], 10) - 1; // 0-indexed
    const localYear = parseInt(todayStr.split("-")[0], 10);

    let startLimit: Date;
    let endLimit: Date;

    if (localDay <= 15) {
        startLimit = new Date(`${localYear}-${String(localMonth + 1).padStart(2, '0')}-01T00:00:00-03:00`);
        endLimit = new Date(`${localYear}-${String(localMonth + 1).padStart(2, '0')}-15T23:59:59-03:00`);
    } else {
        startLimit = new Date(`${localYear}-${String(localMonth + 1).padStart(2, '0')}-16T00:00:00-03:00`);
        const lastDay = new Date(localYear, localMonth + 1, 0).getDate();
        endLimit = new Date(`${localYear}-${String(localMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59-03:00`);
    }

    const selectedDayStart = new Date(`${dateClean}T00:00:00-03:00`);

    if (selectedDayStart < todayStart || selectedDayStart > endLimit) return [];
    if (dayOfWeek === 0 || dayOfWeek === 6) return []; // Ocultar finais de semana

    const availabilities = await prisma.availability.findMany({
        where: {
            dayOfWeek,
        }
    });

    if (availabilities.length === 0) return [];

    // 2. Buscar pacientes fixos para este dia da semana
    const fixedPatients = await prisma.patient.findMany({
        where: { isFixed: true, fixedDayOfWeek: dayOfWeek, deletedAt: null }
    });
    const fixedTimes = fixedPatients.map(p => p.fixedTime);

    const startOfDaySP = new Date(`${dateClean}T00:00:00-03:00`);
    const endOfDaySP = new Date(`${dateClean}T23:59:59-03:00`);

    const appointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startOfDaySP,
                lte: endOfDaySP,
            },
            status: { not: 'CANCELLED' },
            deletedAt: null
        }
    });

    const scheduleBlocks = await prisma.scheduleBlock.findMany({
        where: {
            OR: [
                { endDate: null },
                { endDate: { gt: now } }
            ]
        }
    });

    const slots = [];
    const sessionDuration = 30;
    const buffer = 0;

    for (const availability of availabilities) {
        let currentMinutes = availability.startTime;

        while (currentMinutes + sessionDuration <= availability.endTime) {
            const hours = Math.floor(currentMinutes / 60);
            const minutes = currentMinutes % 60;
            const slotStart = new Date(`${dateClean}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00-03:00`);
            const slotEnd = addMinutes(slotStart, sessionDuration);

            let isWithinDeadline = true;

            if (currentMinutes < 870) {
                const prevDayStr = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "America/Sao_Paulo",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }).format(new Date(selectedDayStart.getTime() - 24 * 60 * 60 * 1000));
                
                const realDeadline = new Date(`${prevDayStr}T21:00:00-03:00`);
                if (now > realDeadline) isWithinDeadline = false;
            }
            else if (currentMinutes >= 870 && currentMinutes < 900) {
                const realDeadline = new Date(slotStart.getTime() - 2 * 60 * 60 * 1000);
                if (now > realDeadline) isWithinDeadline = false;
            }
            else {
                const realDeadline = new Date(slotStart.getTime() - 30 * 60 * 1000);
                if (now > realDeadline) isWithinDeadline = false;
            }

            if (isWithinDeadline) {
                const isOccupied = appointments.some((app: any) => {
                    const appStart = new Date(app.startTime);
                    const appEnd = new Date(app.endTime);
                    return (
                        (isAfter(slotStart, appStart) && isBefore(slotStart, appEnd)) ||
                        (isAfter(slotEnd, appStart) && isBefore(slotEnd, appEnd)) ||
                        (slotStart.getTime() === appStart.getTime())
                    );
                });

                const isBlocked = scheduleBlocks.some((block: any) => {
                    if (block.endDate === null) {
                        return slotStart >= new Date(block.startDate);
                    }
                    return slotStart >= new Date(block.startDate) && slotStart < new Date(block.endDate);
                });

                const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                if (!isOccupied && !fixedTimes.includes(timeStr) && !isBlocked) {
                    slots.push(timeStr);
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

    const psychologist = await prisma.psychologist.findFirst();

    if (!psychologist) return { success: false, error: "Psicóloga não encontrada no sistema. Verifique o cadastro." };

    const dateClean = date.substring(0, 10);
    const startTime = new Date(`${dateClean}T${time}:00-03:00`);
    const endTime = addMinutes(startTime, 30);

    // Prevent double booking
    const localDateForDay = new Date(startTime.getTime() - 3 * 60 * 60 * 1000);
    const dayOfWeek = localDateForDay.getUTCDay();
    const overlapApp = await prisma.appointment.findFirst({
        where: {
            startTime: {
                gte: startTime,
                lt: endTime,
            },
            status: { not: 'CANCELLED' },
            deletedAt: null
        }
    });

    const fixedPatients = await prisma.patient.findMany({
        where: { isFixed: true, fixedDayOfWeek: dayOfWeek, deletedAt: null }
    });
    const fixedTimes = fixedPatients.map(p => p.fixedTime);
    const isFixedOccupied = fixedTimes.includes(time);

    if (overlapApp || isFixedOccupied) {
        return { success: false, error: "Este horário já foi reservado por outro paciente. Por favor, escolha outro horário." };
    }

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

    const formattedDetails = formatAppointmentDetailsForWhatsApp({
        patient,
        startTime: appointment.startTime,
        type: appointment.type
    });

    // Notify psychologist of new booking
    try {
        await notifyPsychologist(
            `🔔 *Novo Agendamento Realizado!*\n\n👤 *Paciente*: ${patient.name}\n📞 *Telefone*: ${patient.phone}\n${formattedDetails}`
        );
    } catch (e) {
        console.error("Failed to notify psychologist:", e);
    }

    // Notify patient of new booking via local Baileys API
    try {
        await notifyPatient(
            patient.phone,
            `Olá ${patient.name}! Seu agendamento na Clínica Equilíbrio foi confirmado com sucesso!\n\n${formattedDetails}`
        );
    } catch (e) {
        console.error("Failed to notify patient of booking:", e);
    }

    revalidatePath('/paciente/minha-agenda');
    return { success: true, appointmentId: appointment.id, meetLink };
}

export async function loginPatient(phone: string, password: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const patients = await prisma.patient.findMany({
        where: { deletedAt: null }
    });
    
    const patient: any = patients.find((p: any) => p.phone.replace(/\D/g, '') === cleanPhone);

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

export async function forgotPassword(identifier: string, type: "PATIENT" | "PSYCHOLOGIST") {
    if (type === "PSYCHOLOGIST") {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiry = new Date(Date.now() + 3600000); // 1 hora
        
        const user = await prisma.psychologist.findUnique({ where: { email: identifier } });
        if (!user) return { success: false, error: "Usuário não encontrado." };
        await prisma.psychologist.update({
            where: { email: identifier },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });
        
        // Simulação de envio de e-mail
        console.log(`[EMAIL] Link de recuperação para ${identifier}: https://equilibrio-psi.vercel.app/recuperar-senha?token=${token}`);
        
        return { success: true, message: "E-mail de recuperação enviado." };
    } else {
        // Patient recovery via WhatsApp
        const cleanPhone = identifier.replace(/\D/g, '');
        const patients = await prisma.patient.findMany({ where: { deletedAt: null } });
        const user: any = patients.find((p: any) => p.phone.replace(/\D/g, '') === cleanPhone);
        
        if (!user) return { success: false, error: "Paciente não encontrado com este número." };
        
        // Generate 6 digit temporary pin
        const tempPin = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(tempPin, 10);
        
        await prisma.patient.update({
            where: { id: user.id },
            data: { 
                password: hashedPassword,
                mustChangePassword: true 
            }
        });
        
        await notifyPatient(
            user.phone,
            `Olá ${user.name.split(' ')[0]}, recebemos uma solicitação de recuperação de senha.\n\nSua nova senha temporária é: *${tempPin}*\n\nAcesse o portal e você será solicitado a criar uma nova senha definitiva.`
        );
        
        return { success: true, message: "Senha temporária enviada para o seu WhatsApp!" };
    }
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

    try {
        let prefs = "";
        if (data.specificDate) {
            prefs = `📅 Data: ${format(data.specificDate, 'dd/MM/yyyy')}`;
            if (data.specificTime) prefs += `\n⏰ Horário: ${data.specificTime}`;
        } else {
            prefs = `📅 Dias: ${data.preferredDays || 'Qualquer dia'}\n⏰ Turno: ${data.preferredShift === 'MANHA' ? 'Manhã' : 'Tarde'}`;
        }

        const firstName = data.name.split(' ')[0];
        await notifyPatient(
            data.phone,
            `Olá ${firstName}! Recebemos o seu pedido para a *Lista de Espera* da Clínica Equilíbrio.\n\n*Suas Preferências:*\n${prefs}\n\nAssim que surgir uma vaga, avisaremos você por aqui! 🌟`
        );
    } catch (e) {
        console.error("Erro ao notificar paciente da entrada na lista de espera:", e);
    }

    revalidatePath('/area-clinica/lista-espera');
    return { success: true };
}

// Devolve para PENDING quem foi avisado de uma vaga mas o horário dela já passou sem agendar
export async function requeueExpiredWaitingListNotifications() {
    const now = getLocalNow();
    await prisma.waitingList.updateMany({
        where: {
            status: "NOTIFIED",
            notifiedForDate: { lt: now }
        },
        data: {
            status: "PENDING",
            notifiedAt: null,
            notifiedForDate: null
        }
    });
}

export async function getWaitingList() {
    await requeueExpiredWaitingListNotifications();
    return await prisma.waitingList.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getPatientWaitingList(phone: string) {
    await requeueExpiredWaitingListNotifications();
    return await prisma.waitingList.findMany({
        where: { phone, status: "PENDING" },
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

export async function resolveFixedVirtualAppointment(id: string, defaultStatus: AppointmentStatus = AppointmentStatus.CONFIRMED): Promise<string> {
    if (id.startsWith("fixed-")) {
        const parts = id.substring("fixed-".length);
        const dateStr = parts.slice(-12);
        const patientId = parts.slice(0, -13);

        const year = parseInt(dateStr.slice(0, 4), 10);
        const month = parseInt(dateStr.slice(4, 6), 10) - 1;
        const day = parseInt(dateStr.slice(6, 8), 10);
        const hours = parseInt(dateStr.slice(8, 10), 10);
        const minutes = parseInt(dateStr.slice(10, 12), 10);
        
        const startTime = new Date(year, month, day, hours, minutes, 0, 0);
        const endTime = addMinutes(startTime, 30);

        // Check if an appointment already exists for this slot
        const existing = await prisma.appointment.findFirst({
            where: {
                patientId,
                startTime,
                deletedAt: null
            }
        });

        if (existing) {
            return existing.id;
        }

        const psychologist = await prisma.psychologist.findFirst();
        if (!psychologist) throw new Error("Psicóloga não encontrada no sistema.");

        const created = await prisma.appointment.create({
            data: {
                startTime,
                endTime,
                psychologistId: psychologist.id,
                patientId,
                status: defaultStatus,
                type: "ONLINE",
            }
        });

        return created.id;
    }
    return id;
}

const WEEKDAY_NAME_TO_NUM: Record<string, number> = {
    "Domingo": 0,
    "Segunda-feira": 1,
    "Terça-feira": 2,
    "Quarta-feira": 3,
    "Quinta-feira": 4,
    "Sexta-feira": 5,
    "Sábado": 6,
};

const WEEKDAY_LABELS: Record<number, string> = {
    0: "domingo",
    1: "segunda-feira",
    2: "terça-feira",
    3: "quarta-feira",
    4: "quinta-feira",
    5: "sexta-feira",
    6: "sábado",
};

function matchesPreferredDay(preferredDays: string | null, dayOfWeek: number): boolean {
    if (!preferredDays) return true; // "Qualquer dia"
    return WEEKDAY_NAME_TO_NUM[preferredDays] === dayOfWeek;
}

function matchesPreferredShift(preferredShift: string | null, hour: number): boolean {
    if (!preferredShift) return true;
    const isMorning = hour < 12;
    return preferredShift === "MANHA" ? isMorning : !isMorning;
}

export async function cancelAppointment(appointmentId: string, confirmLateCharge: boolean = false, isProfessional: boolean = false) {
    const resolvedId = await resolveFixedVirtualAppointment(appointmentId, AppointmentStatus.CONFIRMED);
    const appointment = await prisma.appointment.findUnique({
        where: { id: resolvedId },
        include: { psychologist: true, patient: true }
    });

    if (!appointment) throw new Error("Agendamento não encontrado");

    const now = getLocalNow();
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
        where: { id: resolvedId },
        data: { status: "CANCELLED" }
    });

    const formattedDetails = formatAppointmentDetailsForWhatsApp({
        patient: appointment.patient,
        startTime: appointment.startTime,
        type: appointment.type
    });

    const isLateCancellation = !isProfessional && hoursUntilSession <= 3;

    // Notify psychologist of cancellation
    try {
        const byWho = isProfessional ? "pela Profissional" : "pelo Paciente";
        const lateNotice = isLateCancellation
            ? "\n\n💰 *Cobrança*: Cancelamento com menos de 3h de antecedência — o paciente foi avisado que a consulta será cobrada integralmente."
            : "";
        await notifyPsychologist(
            `❌ *Sessão Cancelada!*\n\n👤 *Paciente*: ${appointment.patient.name}\n📞 *Telefone*: ${appointment.patient.phone}\n${formattedDetails}\n🚫 *Motivo*: Cancelado ${byWho}${lateNotice}`
        );
    } catch (e) {
        console.error("Failed to notify psychologist of cancellation:", e);
    }

    // Notify patient of cancellation via local Baileys API
    try {
        const chargeNotice = isLateCancellation
            ? "\n\n⚠️ *Aviso Importante*: Como o cancelamento foi realizado com menos de 3 horas de antecedência, informamos que o valor da consulta será cobrado integralmente, conforme nossa política de agendamentos."
            : "";

        await notifyPatient(
            appointment.patient.phone,
            `Olá ${appointment.patient.name}. Informamos que o seu agendamento na Clínica Equilíbrio foi CANCELADO.\n\n${formattedDetails}${chargeNotice}`
        );
    } catch (e) {
        console.error("Failed to notify patient of cancellation via WhatsApp:", e);
    }

    // Lógica de Lista de Espera: Notificar interessados
    try {
        await requeueExpiredWaitingListNotifications();

        const timeStr = format(appointment.startTime, 'HH:mm');

        // 1. Prioridade: Quem pediu ESSE horário específico
        const specificInterested = await prisma.waitingList.findMany({
            where: {
                status: "PENDING",
                specificTime: timeStr,
                specificDate: {
                    gte: startOfDay(appointment.startTime),
                    lte: endOfDay(appointment.startTime)
                }
            }
        });

        // 2. Geral: Quem está na lista esperando qualquer vaga, filtrado pelo dia/turno de preferência
        const generalCandidates = await prisma.waitingList.findMany({
            where: {
                status: "PENDING",
                specificDate: null
            }
        });

        const dayOfWeek = appointment.startTime.getDay();
        const hour = appointment.startTime.getHours();
        const generalInterested = generalCandidates.filter(w =>
            matchesPreferredDay(w.preferredDays, dayOfWeek) &&
            matchesPreferredShift(w.preferredShift, hour)
        );

        const allToNotify = [...specificInterested, ...generalInterested];

        if (allToNotify.length > 0) {
            // Marcar como notificados, guardando a data/hora da vaga avisada
            await prisma.waitingList.updateMany({
                where: { id: { in: allToNotify.map(i => i.id) } },
                data: { status: "NOTIFIED", notifiedAt: now, notifiedForDate: appointment.startTime }
            });

            // Disparar WhatsApp para todos (First come, first served)
            const dateFormatted = format(appointment.startTime, "dd/MM 'às' HH:mm");
            for (const interested of allToNotify) {
                try {
                    await notifyPatient(
                        interested.phone,
                        `🌟 *Vaga Liberada!*\n\nOlá ${interested.name}, um horário que você aguardava acabou de ser liberado na Clínica Equilíbrio para *${dateFormatted}*!\n\nCorra para garantir: https://www.cliseide.com.br/agendar\n\n_(O primeiro a agendar fica com a vaga)_`
                    );
                } catch (err) {
                    console.error("Erro ao notificar paciente da lista de espera:", err);
                }
            }
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
    const resolvedId = await resolveFixedVirtualAppointment(id, AppointmentStatus.CONFIRMED);
    const app = await prisma.appointment.update({
        where: { id: resolvedId },
        data: { status: "CONFIRMED" },
        select: { patientId: true }
    });

    revalidatePath('/area-clinica');
    return { success: true, patientId: app.patientId };
}

export async function setAbsent(id: string) {
    const resolvedId = await resolveFixedVirtualAppointment(id, AppointmentStatus.CONFIRMED);
    const appointment = await prisma.appointment.update({
        where: { id: resolvedId },
        data: { status: AppointmentStatus.ABSENT },
        include: { patient: true }
    });

    const formattedDetails = formatAppointmentDetailsForWhatsApp({
        patient: appointment.patient,
        startTime: appointment.startTime,
        type: appointment.type
    });

    // Avisa o paciente sobre a cobrança integral por falta sem aviso
    try {
        await notifyPatient(
            appointment.patient.phone,
            `Olá ${appointment.patient.name}. Notamos que você não compareceu à sua sessão na Clínica Equilíbrio.\n\n${formattedDetails}\n\n⚠️ *Aviso Importante*: Como não houve aviso prévio de cancelamento, o valor da consulta será cobrado integralmente, conforme nossa política de agendamentos.`
        );
    } catch (e) {
        console.error("Failed to notify patient of absence:", e);
    }

    // Avisa a psicóloga que a falta foi registrada e o paciente foi notificado da cobrança
    try {
        await notifyPsychologist(
            `⚠️ *Falta Registrada!*\n\n👤 *Paciente*: ${appointment.patient.name}\n📞 *Telefone*: ${appointment.patient.phone}\n${formattedDetails}\n💰 O paciente foi avisado sobre a cobrança integral da sessão.`
        );
    } catch (e) {
        console.error("Failed to notify psychologist of absence:", e);
    }

    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
    return { success: true };
}

export async function completeAppointment(id: string) {
    const resolvedId = await resolveFixedVirtualAppointment(id, AppointmentStatus.CONFIRMED);
    const updatedAppointment = await prisma.appointment.update({
        where: { id: resolvedId },
        data: { status: AppointmentStatus.COMPLETED },
        include: { patient: true }
    });

    if (updatedAppointment.patient.isFixed) {
        try {
            await notifyPsychologist(
                `📝 *Consulta Finalizada!*\n\n👤 *Paciente*: ${updatedAppointment.patient.name}\n\n⚠️ *Atenção*: Última consulta realizada. Lembre-se de reagendar os próximos 15 dias fixos para este paciente.`
            );
        } catch (e) {
            console.error("Failed to notify psychologist of completed fixed appointment:", e);
        }
    }

    revalidatePath('/area-clinica');
    revalidatePath('/area-clinica/agenda');
    return { success: true };
}

export async function revertAppointmentStatus(id: string) {
    const resolvedId = await resolveFixedVirtualAppointment(id, AppointmentStatus.CONFIRMED);
    await prisma.appointment.update({
        where: { id: resolvedId },
        data: { status: AppointmentStatus.CONFIRMED },
    });
    revalidatePath("/area-clinica");
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
            date: date || getLocalNow()
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
    const psychologist = await prisma.psychologist.findFirst();

    if (!psychologist) throw new Error("Psicóloga não encontrada");

    const startTime = new Date(data.date);
    const endTime = addMinutes(startTime, 30);

    // Prevent double booking
    const localDate = new Date(startTime.getTime() - 3 * 60 * 60 * 1000);
    const hoursStr = String(localDate.getUTCHours()).padStart(2, '0');
    const minutesStr = String(localDate.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hoursStr}:${minutesStr}`;
    const dayOfWeek = localDate.getUTCDay();
    const overlapApp = await prisma.appointment.findFirst({
        where: {
            startTime: {
                gte: startTime,
                lt: endTime,
            },
            status: { not: 'CANCELLED' },
            deletedAt: null
        }
    });

    const fixedPatients = await prisma.patient.findMany({
        where: { isFixed: true, fixedDayOfWeek: dayOfWeek, deletedAt: null }
    });
    const fixedTimes = fixedPatients.map(p => p.fixedTime);
    const isFixedOccupied = fixedTimes.includes(timeStr);

    if (overlapApp || isFixedOccupied) {
        throw new Error("Este horário já está reservado por outra consulta.");
    }

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

    // Notify psychologist and patient of manual booking
    const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    if (patient) {
        const formattedDetails = formatAppointmentDetailsForWhatsApp({
            patient,
            startTime: appointment.startTime,
            type: appointment.type
        });

        try {
            await notifyPsychologist(
                `🔔 *Novo Agendamento Manual Realizado!*\n\n👤 *Paciente*: ${patient.name}\n📞 *Telefone*: ${patient.phone}\n${formattedDetails}`
            );
        } catch (e) {
            console.error("Failed to notify psychologist of manual booking:", e);
        }

        try {
            await notifyPatient(
                patient.phone,
                `Olá ${patient.name}! Seu agendamento na Clínica Equilíbrio foi confirmado com sucesso!\n\n${formattedDetails}`
            );
        } catch (e) {
            console.error("Failed to notify patient of manual booking:", e);
        }
    }

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
    revalidatePath('/', 'layout');
    return { success: true };
}

export async function updatePatientProfile(data: { name: string, email: string, password?: string }) {
    const cookieStore = await cookies();
    const patientId = cookieStore.get('patient_id')?.value;
    if (!patientId) return { success: false, error: 'Não autorizado' };

    const updateData: any = { name: data.name, email: data.email };
    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
        updateData.mustChangePassword = false;
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
            password: hashedPassword,
            mustChangePassword: password === "psicologa123"
        }
    });

    // Auto-login setting cookie
    const cookieStore = await cookies();
    cookieStore.set("patient_id", patient.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });

    return { success: true, patient };
}

export async function updatePsychologistAvailability(availabilities: { dayOfWeek: number; startTimeStr: string; endTimeStr: string }[]) {
    try {
        const psychologist = await prisma.psychologist.findFirst();
        if (!psychologist) throw new Error("Psicóloga não encontrada");

        // Limpa disponibilidades antigas
        await prisma.availability.deleteMany({
            where: { psychologistId: psychologist.id }
        });

        // Cria novas disponibilidades
        const data = availabilities.map(av => {
            const [sh, sm] = av.startTimeStr.split(":").map(Number);
            const [eh, em] = av.endTimeStr.split(":").map(Number);
            return {
                dayOfWeek: av.dayOfWeek,
                startTime: sh * 60 + sm,
                endTime: eh * 60 + em,
                psychologistId: psychologist.id
            };
        });

        await prisma.availability.createMany({
            data
        });

        revalidatePath('/area-clinica');
        revalidatePath('/area-clinica/agenda');
        revalidatePath('/agendar');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating psychologist availability:", error);
        return { success: false, error: error.message || "Erro desconhecido ao salvar disponibilidades" };
    }
}

export async function updatePatientFixedSchedule(patientId: string, isFixed: boolean, fixedDayOfWeek?: number | null, fixedTime?: string | null) {
    try {
        const patient = await prisma.patient.update({
            where: { id: patientId },
            data: {
                isFixed,
                fixedDayOfWeek: isFixed ? fixedDayOfWeek : null,
                fixedTime: isFixed ? fixedTime : null
            }
        });

        if (isFixed && fixedDayOfWeek !== null && fixedDayOfWeek !== undefined && fixedTime) {
            try {
                const dayLabel = WEEKDAY_LABELS[fixedDayOfWeek] || `dia ${fixedDayOfWeek}`;
                await notifyPatient(
                    patient.phone,
                    `Olá ${patient.name}! Seu horário fixo semanal na Clínica Equilíbrio foi confirmado: toda ${dayLabel} às ${fixedTime}. Esse horário fica reservado automaticamente para você todas as semanas. 🌟`
                );
            } catch (e) {
                console.error("Failed to notify patient of fixed schedule:", e);
            }
        }

        revalidatePath('/area-clinica');
        revalidatePath('/area-clinica/agenda');
        revalidatePath('/area-clinica/pacientes');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating patient fixed schedule:", error);
        return { success: false, error: error.message || "Erro desconhecido ao salvar paciente fixo" };
    }
}

import { eachDayOfInterval } from "date-fns";

export async function getAppointmentsWithFixed(startDate: Date, endDate: Date) {
    const actualAppointments = await prisma.appointment.findMany({
        where: {
            startTime: {
                gte: startDate,
                lte: endDate,
            },
            deletedAt: null
        },
        include: {
            patient: true
        },
        orderBy: { startTime: 'asc' }
    });

    const fixedPatients = await prisma.patient.findMany({
        where: { isFixed: true, deletedAt: null }
    });

    const combined = [...actualAppointments];

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    for (const day of days) {
        const dayOfWeek = getDay(day);
        const matchingPatients = fixedPatients.filter(p => p.fixedDayOfWeek === dayOfWeek);

        for (const patient of matchingPatients) {
            if (!patient.fixedTime) continue;
            const [hours, minutes] = patient.fixedTime.split(":").map(Number);
            const slotStart = setMinutes(setHours(startOfDay(day), hours), minutes);
            const slotEnd = addMinutes(slotStart, 30);

            const isOverlap = actualAppointments.some(app => {
                const appStart = new Date(app.startTime);
                const appEnd = new Date(app.endTime);
                return (
                    (isAfter(slotStart, appStart) && isBefore(slotStart, appEnd)) ||
                    (isAfter(slotEnd, appStart) && isBefore(slotEnd, appEnd)) ||
                    (slotStart.getTime() === appStart.getTime())
                );
            });

            if (!isOverlap) {
                combined.push({
                    id: `fixed-${patient.id}-${format(slotStart, 'yyyyMMddHHmm')}`,
                    startTime: slotStart,
                    endTime: slotEnd,
                    status: "CONFIRMED",
                    type: "ONLINE",
                    meetLink: null,
                    psychologistId: "",
                    patientId: patient.id,
                    deletedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    patient: patient as any
                });
            }
        }
    }

    return combined.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export async function resetPatientPassword(patientId: string) {
    const hashedPassword = await bcrypt.hash("psicologa123", 10);
    await prisma.patient.update({
        where: { id: patientId },
        data: {
            password: hashedPassword,
            mustChangePassword: true
        }
    });
    revalidatePath(`/area-clinica/prontuarios/${patientId}`);
    return { success: true };
}

export async function updatePsychologistProfile(data: {
    name: string;
    email: string;
    crp: string;
    phone: string;
    whatsappNotifications?: boolean;
    whatsappNumber?: string;
    whatsappApiKey?: string;
}) {
    const psychologist = await prisma.psychologist.findFirst();
    if (!psychologist) throw new Error("Psicóloga não encontrada");

    await prisma.psychologist.update({
        where: { id: psychologist.id },
        data: {
            name: data.name,
            email: data.email,
            crp: data.crp,
            phone: data.phone,
            ...(data.whatsappNotifications !== undefined && { whatsappNotifications: data.whatsappNotifications }),
            ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
            ...(data.whatsappApiKey !== undefined && { whatsappApiKey: data.whatsappApiKey }),
        }
    });

    revalidatePath('/area-clinica');
    return { success: true };
}

export async function getScheduleBlocks() {
    return prisma.scheduleBlock.findMany({
        orderBy: { startDate: 'asc' }
    });
}

export async function createScheduleBlock(adminId: string, startDate: Date, endDate: Date | null, reason?: string, cancelOverlapping: boolean = false) {
    try {
        await prisma.scheduleBlock.create({
            data: {
                psychologistId: adminId,
                startDate,
                endDate,
                reason
            }
        });

        if (cancelOverlapping && endDate) {
            // Cancelar agendamentos que caem dentro deste período
            await prisma.appointment.updateMany({
                where: {
                    psychologistId: adminId,
                    startTime: {
                        gte: startDate,
                        lt: endDate
                    },
                    status: {
                        in: ['PENDING', 'CONFIRMED']
                    }
                },
                data: {
                    status: 'CANCELLED'
                }
            });
        }

        revalidatePath('/area-clinica');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Failed to create schedule block:", e);
        return { success: false, error: e.message || "Erro ao criar bloqueio na agenda." };
    }
}

export async function deleteScheduleBlock(blockId: string) {
    try {
        const block = await prisma.scheduleBlock.findUnique({ where: { id: blockId } });
        
        await prisma.scheduleBlock.delete({
            where: { id: blockId }
        });

        if (block && block.endDate) {
            // Restaurar agendamentos que foram cancelados devido a este bloqueio
            await prisma.appointment.updateMany({
                where: {
                    psychologistId: block.psychologistId,
                    startTime: {
                        gte: block.startDate,
                        lt: block.endDate
                    },
                    status: 'CANCELLED'
                },
                data: {
                    status: 'CONFIRMED'
                }
            });
        }

        revalidatePath('/area-clinica');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Failed to delete schedule block:", e);
        return { success: false, error: e.message || "Erro ao remover bloqueio da agenda." };
    }
}
