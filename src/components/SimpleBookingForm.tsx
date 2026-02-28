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
    MapPin,
    Clock,
    User,
    CheckCircle2,
    ChevronLeft,
    ShieldCheck,
    Calendar as CalendarIcon,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WaitingListDialog } from "./WaitingListDialog";

type Step = "date" | "slot" | "details";

export default function SimpleBookingForm({ availabilityRules }: { availabilityRules: any[] }) {
    const [step, setStep] = useState<Step>("date");
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

    const fetchSlots = (date: Date) => {
        startTransition(async () => {
            const result = await getAvailableSlots(date.toISOString());
            setSlots(result);
        });
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        if (date) {
            fetchSlots(date);
            setStep("slot");
        }
    };

    const handleSlotSelect = (slot: string) => {
        setSelectedSlot(slot);
    };

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

    const progress = step === "date" ? 33 : step === "slot" ? 66 : 100;

    return (
        <div className="max-w-2xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Progress Indicator */}
            <div className="px-4">
                <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-stone-900 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3 px-1">
                    <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", step === 'date' ? "text-stone-900" : "text-stone-300")}>Data</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", step === 'slot' ? "text-stone-900" : "text-stone-300")}>Horário</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", step === 'details' ? "text-stone-900" : "text-stone-300")}>Finalização</span>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-8 md:p-12 border border-stone-100/50 min-h-[500px] flex flex-col">
                <div className="flex-1">
                    {step === "date" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <h3 className="text-3xl font-light text-stone-900">Selecione uma <span className="italic font-serif">Data</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Quando você prefere seu atendimento?</p>
                            </div>

                            <div className="flex justify-center py-4">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                                    locale={ptBR}
                                    classNames={{
                                        months: "w-full",
                                        caption: "flex justify-between items-center px-4 mb-4",
                                        caption_label: "text-sm font-black uppercase tracking-widest text-stone-800",
                                        nav: "flex gap-2",
                                        nav_button: "h-10 w-10 flex items-center justify-center rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-900 transition-all",
                                        table: "w-full border-collapse",
                                        head_row: "flex justify-between mb-4",
                                        head_cell: "text-stone-300 w-10 font-black text-[9px] uppercase tracking-widest",
                                        row: "flex justify-between mb-1",
                                        cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
                                        day: cn(
                                            "h-10 w-10 p-0 font-bold hover:bg-stone-50 rounded-xl transition-all text-sm text-stone-600 flex items-center justify-center cursor-pointer"
                                        ),
                                        day_selected: "bg-stone-900 text-white hover:bg-stone-900 hover:text-white shadow-xl shadow-stone-200",
                                        day_today: "text-stone-900 border-b-2 border-stone-900 rounded-none",
                                        day_outside: "text-stone-200 opacity-20",
                                        day_disabled: "text-stone-100",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {step === "slot" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep("date")}
                                    className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400 hover:text-stone-900"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                                        {selectedDate ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : ""}
                                    </p>
                                    <h3 className="text-2xl font-light text-stone-900">Qual o melhor <span className="italic font-serif">Horário</span>?</h3>
                                </div>
                                <div className="w-8" />
                            </div>

                            {isPending ? (
                                <div className="py-20 flex flex-col items-center gap-4 text-stone-300">
                                    <Loader2 className="animate-spin" size={32} strokeWidth={1} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Buscando horários...</p>
                                </div>
                            ) : slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => handleSlotSelect(slot)}
                                            className={cn(
                                                "h-14 rounded-2xl text-xs font-bold transition-all border",
                                                selectedSlot === slot
                                                    ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200 scale-[1.03]"
                                                    : "bg-stone-50 border-stone-100 text-stone-500 hover:bg-white hover:border-stone-200"
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center space-y-6">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                                        <CalendarIcon size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-stone-500 italic">Agenda cheia para este dia.</p>
                                        <div className="pt-4 flex justify-center text-left">
                                            <WaitingListDialog rules={availabilityRules} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedSlot && (
                                <div className="pt-8">
                                    <Button
                                        onClick={() => setStep("details")}
                                        className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-stone-200 flex items-center justify-center gap-2 group transition-all"
                                    >
                                        Continuar
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === "details" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setStep("slot")}
                                    className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400 hover:text-stone-900"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                        <ShieldCheck size={12} /> Etapa Final
                                    </div>
                                    <h3 className="text-2xl font-light text-stone-900">Quase <span className="italic font-serif">Tudo Pronto</span></h3>
                                </div>
                                <div className="w-8" />
                            </div>

                            <div className="p-1 bg-stone-100 rounded-2xl flex gap-1">
                                <button
                                    onClick={() => setAppointmentType('PRESENCIAL')}
                                    className={cn(
                                        "flex-1 py-4 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        appointmentType === 'PRESENCIAL' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-500"
                                    )}
                                >
                                    <MapPin size={14} /> Presencial
                                </button>
                                <button
                                    onClick={() => setAppointmentType('ONLINE')}
                                    className={cn(
                                        "flex-1 py-4 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        appointmentType === 'ONLINE' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-500"
                                    )}
                                >
                                    <Monitor size={14} /> Atendimento Online
                                </button>
                            </div>

                            <div className="space-y-4">
                                {isLoggedIn ? (
                                    <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-800 font-bold">
                                                {name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-stone-900">{name}</p>
                                                <p className="text-[10px] text-stone-400 font-mono italic">{phone}</p>
                                            </div>
                                        </div>
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={16} />
                                            <input
                                                className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 focus:bg-white transition-all placeholder:text-stone-300"
                                                placeholder="Nome completo"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={16} />
                                            <input
                                                className="w-full h-14 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 focus:bg-white transition-all placeholder:text-stone-300"
                                                placeholder="WhatsApp (com DDD)"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={16} />
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

                            <div className="space-y-4 pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full h-16 bg-stone-900 hover:bg-stone-800 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-stone-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Finalizar Agendamento"}
                                </Button>
                                <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest text-center px-8 leading-relaxed">
                                    Ao confirmar você reserva seu horário e concorda com as diretrizes de cancelamento.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
