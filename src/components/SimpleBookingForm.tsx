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
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 p-8 md:p-12 bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 max-w-6xl mx-auto border border-stone-100/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left column: Calendar & Slots */}
            <div className="space-y-10">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-light text-stone-900 tracking-tight">Escolha o <span className="italic font-serif text-stone-500">momento ideal</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Verifique a disponibilidade em tempo real</p>
                </div>

                <div className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 flex justify-center">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                        locale={ptBR}
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center mb-4",
                            caption_label: "text-sm font-black uppercase tracking-widest text-stone-800",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                                "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
                            ),
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-stone-400 rounded-md w-10 font-black text-[10px] uppercase tracking-tighter",
                            row: "flex w-full mt-2",
                            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-stone-900/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: cn(
                                "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-stone-100 rounded-xl transition-all"
                            ),
                            day_selected: "bg-stone-900 text-white hover:bg-stone-800 hover:text-white focus:bg-stone-900 focus:text-white shadow-lg shadow-stone-200",
                            day_today: "text-stone-900 underline underline-offset-4 decoration-2",
                            day_outside: "text-stone-300 opacity-50",
                            day_disabled: "text-stone-200 opacity-30",
                            day_hidden: "invisible",
                        }}
                        components={{
                            // v8 uses IconLeft/IconRight differently or they might be missing in this exact version's types
                        }}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Clock className="text-stone-400" size={18} />
                        <p className="text-xs font-black uppercase tracking-widest text-stone-600">Horários disponíveis</p>
                    </div>

                    {!selectedDate ? (
                        <div className="py-12 border-2 border-dashed border-stone-100 rounded-2xl flex flex-center justify-center items-center">
                            <p className="text-stone-300 text-sm italic">Selecione uma data no calendário acima.</p>
                        </div>
                    ) : isPending ? (
                        <div className="flex items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-stone-300" size={20} />
                            <span className="text-stone-400 text-sm font-medium">Buscando disponibilidades...</span>
                        </div>
                    ) : slots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                        "py-3 rounded-xl text-xs font-bold border transition-all",
                                        selectedSlot === slot
                                            ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200 scale-105"
                                            : "bg-white border-stone-100 text-stone-500 hover:border-stone-300 hover:bg-stone-50"
                                    )}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 bg-stone-50 rounded-2xl flex flex-center justify-center items-center">
                            <p className="text-stone-400 text-sm italic">Nenhum horário disponível para esta data.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right column: Modality, Data & Confirm */}
            <div className="space-y-10 lg:pl-12 lg:border-l border-stone-100">
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-light text-stone-900 tracking-tight">Modalidade</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Como prefere ser atendido(a)?</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setAppointmentType('PRESENCIAL')}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all group",
                                appointmentType === 'PRESENCIAL'
                                    ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200"
                                    : "bg-white border-stone-100 text-stone-500 hover:border-stone-300"
                            )}
                        >
                            <Building2 size={24} className={cn(appointmentType === 'PRESENCIAL' ? "text-white" : "text-stone-400 group-hover:text-stone-900")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Presencial</span>
                        </button>
                        <button
                            onClick={() => setAppointmentType('ONLINE')}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all group",
                                appointmentType === 'ONLINE'
                                    ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200"
                                    : "bg-white border-stone-100 text-stone-500 hover:border-stone-300"
                            )}
                        >
                            <Monitor size={24} className={cn(appointmentType === 'ONLINE' ? "text-white" : "text-stone-400 group-hover:text-stone-900")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Atendimento Online</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-light text-stone-900 tracking-tight">Dados Pessoais</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Identificação para o prontuário</p>
                    </div>

                    {isLoggedIn ? (
                        <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">Identificado como</p>
                                <p className="text-lg font-bold text-stone-800 tracking-tight">{name}</p>
                                <p className="text-xs text-stone-500 font-medium">{phone}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-stone-300 border border-stone-100 shadow-sm">
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                <input
                                    className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 focus:bg-white transition-all placeholder:text-stone-300"
                                    placeholder="Nome completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                <input
                                    className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 focus:bg-white transition-all placeholder:text-stone-300"
                                    placeholder="WhatsApp (com DDD)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                <input
                                    type="password"
                                    className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 focus:bg-white transition-all placeholder:text-stone-300"
                                    placeholder="Crie uma senha (mín 4 dígitos)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-stone-100 flex flex-col gap-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="w-full h-16 bg-stone-900 hover:bg-stone-800 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-stone-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-3">
                                <Loader2 className="animate-spin" size={18} />
                                Confirmando Reserva...
                            </span>
                        ) : (
                            "Confirmar Agendamento"
                        )}
                    </Button>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                        Ao confirmar, você concorda com os termos de cancelamento (mínimo 3h de antecedência).
                    </p>
                </div>
            </div>
        </div>
    );
}
