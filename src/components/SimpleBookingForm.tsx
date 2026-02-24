"use client";

import { useState, useEffect, useTransition } from "react";
import { format, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { getAvailableSlots, createAppointment } from "@/lib/actions";
import {
    Loader2,
    Monitor,
    Building2,
    Clock,
    User,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SimpleBookingForm() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [appointmentType, setAppointmentType] = useState<"ONLINE" | "PRESENCIAL">("PRESENCIAL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check login status on mount
    useEffect(() => {
        const patientId = document.cookie.split('; ').find(row => row.startsWith('patient_id='))?.split('=')[1];
        const savedName = localStorage.getItem('patient_name');
        const savedPhone = localStorage.getItem('patient_phone');
        if (patientId && savedName) {
            setIsLoggedIn(true);
            setName(savedName);
            if (savedPhone) setPhone(savedPhone);
            setPassword("SESSION_ACTIVE");
        }
    }, []);

    // Load slots when date changes
    useEffect(() => {
        if (selectedDate) {
            setSelectedSlot(null);
            startTransition(async () => {
                const result = await getAvailableSlots(selectedDate.toISOString());
                setSlots(result);
            });
        }
    }, [selectedDate]);

    const canSubmit = selectedDate && selectedSlot && name.trim() && phone.trim() && (isLoggedIn || password.length >= 4);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
            const result = await createAppointment({
                name,
                email: email || undefined,
                phone,
                password: isLoggedIn ? undefined : password,
                date: selectedDate!.toISOString(),
                time: selectedSlot!,
                type: appointmentType,
            });
            if (!result.success) {
                alert(result.error || "Erro ao agendar. Tente novamente.");
                setIsSubmitting(false);
                return;
            }
            localStorage.setItem('patient_name', name);
            localStorage.setItem('patient_phone', phone);
            window.location.href = '/paciente/minha-agenda';
        } catch (err: any) {
            console.error(err);
            alert("Erro de comunicação com o servidor. Tente novamente.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white rounded-2xl shadow-lg max-w-5xl mx-auto">
            {/* Left column: Calendar & Slots */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-stone-800">Quando?</h3>
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                    locale={ptBR}
                    classNames={{
                        selected: "bg-stone-800 text-white rounded-xl",
                        today: "text-stone-900 font-bold underline",
                    }}
                />
                <div>
                    <p className="text-sm font-medium text-stone-600 mb-2">Horários disponíveis</p>
                    {!selectedDate ? (
                        <p className="text-stone-400 italic">Selecione uma data.</p>
                    ) : isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-stone-500">Buscando...</span>
                        </div>
                    ) : slots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                        "p-2 rounded text-sm border",
                                        selectedSlot === slot
                                            ? "bg-stone-800 text-white border-stone-800"
                                            : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                                    )}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-stone-400 italic">Nenhum horário disponível.</p>
                    )}
                </div>
            </div>

            {/* Right column: Modality, Data & Confirm */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-stone-800">Como?</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setAppointmentType('ONLINE')}
                        className={cn(
                            "flex-1 p-4 rounded border",
                            appointmentType === 'ONLINE' ? "bg-stone-800 text-white border-stone-800" : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                        )}
                    >
                        <Monitor size={20} className="inline-block mr-2" /> Online
                    </button>
                    <button
                        onClick={() => setAppointmentType('PRESENCIAL')}
                        className={cn(
                            "flex-1 p-4 rounded border",
                            appointmentType === 'PRESENCIAL' ? "bg-stone-800 text-white border-stone-800" : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                        )}
                    >
                        <Building2 size={20} className="inline-block mr-2" /> Presencial
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-stone-800">Seus Dados</h3>
                {isLoggedIn ? (
                    <div className="p-4 bg-stone-50 rounded border border-stone-200">
                        <p className="text-sm font-medium">Logado como <span className="font-bold">{name}</span></p>
                        <p className="text-sm">{phone}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Nome completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="WhatsApp"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            placeholder="Senha (mín 4 dígitos)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="bg-stone-800 hover:bg-stone-900 text-white"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Confirmando...</span>
                        ) : (
                            "Confirmar Agendamento"
                        )}
                    </Button>
                    <Info size={16} className="text-stone-400" />
                </div>
            </div>
        </div>
    );
}
