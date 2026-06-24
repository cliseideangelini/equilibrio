"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { format, startOfToday, isSameDay } from "date-fns";
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
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "datetime" | "modality" | "info" | "confirm";

export default function BookingForm() {
    const [step, setStep] = useState<Step>("datetime");
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

    useEffect(() => {
        if (selectedDate) {
            setSelectedSlot(null);
            startTransition(async () => {
                const result = await getAvailableSlots(selectedDate.toISOString());
                setSlots(result);
            });
        }
    }, [selectedDate]);

    const steps: Step[] = ["datetime", "modality", "info", "confirm"];
    const currentStepIndex = steps.indexOf(step);

    const canGoNext = useMemo(() => {
        if (step === "datetime") return selectedDate && selectedSlot;
        if (step === "modality") return !!appointmentType;
        if (step === "info") return name.trim() && phone.trim() && (isLoggedIn || password.length >= 4);
        return true;
    }, [step, selectedDate, selectedSlot, appointmentType, name, phone, password, isLoggedIn]);

    const handleNext = () => {
        if (canGoNext && currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1]);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setStep(steps[currentStepIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        if (!canGoNext) return;
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
        <div className="flex flex-col min-h-[600px]">
            {/* Progress Header */}
            <div className="bg-stone-50/50 border-b border-stone-100 p-6 flex items-center justify-between">
                <div className="flex gap-2">
                    {steps.map((s, idx) => (
                        <div
                            key={s}
                            className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                idx <= currentStepIndex ? "w-8 bg-stone-800" : "w-4 bg-stone-200"
                            )}
                        />
                    ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Passo {currentStepIndex + 1} de {steps.length}
                </span>
            </div>

            <div className="flex-1 p-8 md:p-12">
                {/* Step 1: DateTime */}
                {step === "datetime" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header className="space-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight">Quando deseja ser atendido?</h3>
                            <p className="text-stone-400 text-sm">Escolha uma data e um horário disponível no calendário.</p>
                        </header>

                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 shadow-sm">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                                    locale={ptBR}
                                    className="mx-auto"
                                    classNames={{
                                        selected: "bg-stone-800 text-white hover:bg-stone-700 rounded-xl",
                                        today: "text-stone-900 font-bold underline decoration-2 underline-offset-4",
                                        chevron: "fill-stone-400",
                                    }}
                                />
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                    <Clock size={12} /> Horários para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "--"}
                                </p>

                                {!selectedDate ? (
                                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-stone-100 rounded-[2rem] text-stone-300 text-sm italic">
                                        Aguardando data...
                                    </div>
                                ) : isPending ? (
                                    <div className="aspect-square flex flex-col items-center justify-center gap-4 border-2 border-dashed border-stone-100 rounded-[2rem]">
                                        <Loader2 className="animate-spin text-stone-200" size={32} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Buscando...</span>
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={cn(
                                                    "h-14 rounded-2xl text-xs font-bold transition-all border",
                                                    selectedSlot === slot
                                                        ? "bg-stone-800 text-white border-stone-800 shadow-lg shadow-stone-200 scale-[1.02]"
                                                        : "bg-white border-stone-100 hover:border-stone-300 text-stone-600"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="aspect-square flex items-center justify-center border-2 border-dashed border-stone-100 rounded-[2rem] text-stone-400 text-sm p-8 text-center leading-relaxed">
                                        Nenhum horário disponível <br />para este dia.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Modality */}
                {step === "modality" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                        <header className="space-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight">Qual a sua preferência?</h3>
                            <p className="text-stone-400 text-sm">Escolha como deseja realizar a sua sessão.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setAppointmentType("ONLINE")}
                                className={cn(
                                    "relative p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-6 group",
                                    appointmentType === "ONLINE"
                                        ? "border-stone-800 bg-stone-50"
                                        : "border-stone-100 hover:border-stone-200"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                    appointmentType === "ONLINE" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                                )}>
                                    <Monitor size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800">Atendimento Online</h4>
                                    <p className="text-sm text-stone-400 mt-1 leading-relaxed">Sessão por vídeo-chamada no conforto do seu ambiente.</p>
                                </div>
                                {appointmentType === "ONLINE" && <CheckCircle2 className="absolute top-6 right-6 text-stone-800" size={20} />}
                            </button>

                            <button
                                onClick={() => setAppointmentType("PRESENCIAL")}
                                className={cn(
                                    "relative p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col gap-6 group",
                                    appointmentType === "PRESENCIAL"
                                        ? "border-stone-800 bg-stone-50"
                                        : "border-stone-100 hover:border-stone-200"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                    appointmentType === "PRESENCIAL" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                                )}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800">Atendimento Presencial</h4>
                                    <p className="text-sm text-stone-400 mt-1 leading-relaxed">Converse conosco em nosso consultório físico.</p>
                                </div>
                                {appointmentType === "PRESENCIAL" && <CheckCircle2 className="absolute top-6 right-6 text-stone-800" size={20} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Info */}
                {step === "info" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                        <header className="space-y-2">
                            <h3 className="text-2xl font-semibold tracking-tight">Quase lá! Nos diga quem é você.</h3>
                            <p className="text-stone-400 text-sm">Seus dados estão seguros conosco e serão usados para o atendimento.</p>
                        </header>

                        {isLoggedIn ? (
                            <div className="bg-stone-50 rounded-[2rem] p-8 border border-stone-200 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Sessão Identificada</p>
                                    <p className="text-xl font-bold text-stone-800">{name}</p>
                                    <p className="text-sm text-stone-500">{phone}</p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400">
                                    <User size={32} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                        <input
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-stone-200 focus:border-stone-800 outline-none transition-all font-medium text-sm"
                                            placeholder="Ex: Pedro Henrique"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                        <input
                                            className="w-full h-14 px-6 rounded-2xl bg-white border border-stone-200 focus:border-stone-800 outline-none transition-all font-medium text-sm"
                                            placeholder="(11) 99999-9999"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Criar Senha de Acesso</label>
                                    <input
                                        type="password"
                                        className="w-full h-14 px-6 rounded-2xl bg-white border border-stone-200 focus:border-stone-800 outline-none transition-all font-medium text-sm"
                                        placeholder="No mínimo 4 dígitos"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <p className="text-[9px] text-stone-400 italic">Você usará esta senha para ver e cancelar seus horários depois.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === "confirm" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                        <header className="space-y-2 text-center">
                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-800 ring-8 ring-stone-100/50">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-3xl font-semibold tracking-tight">Tudo pronto?</h3>
                            <p className="text-stone-400 text-sm">Confirme os detalhes do seu agendamento abaixo.</p>
                        </header>

                        <div className="max-w-md mx-auto bg-stone-50 rounded-[2.5rem] border border-stone-100 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-stone-800 shadow-sm">
                                        <CalendarDays size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Data & Hora</p>
                                        <p className="font-bold text-stone-800">{selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "--"} às {selectedSlot}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-stone-800 shadow-sm">
                                        {appointmentType === "ONLINE" ? <Monitor size={20} /> : <Building2 size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Modalidade</p>
                                        <p className="font-bold text-stone-800">{appointmentType === "ONLINE" ? "Atendimento Online" : "Atendimento Presencial"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-stone-800 shadow-sm">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Atendimento Para</p>
                                        <p className="font-bold text-stone-800">{name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 max-w-md mx-auto bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                            <Info size={16} className="text-amber-600 mt-0.5" />
                            <p className="text-[10px] text-amber-900 leading-relaxed font-medium">
                                <strong>Lembrete:</strong> Cancelamentos devem ser feitos com no mínimo 3h de antecedência para evitar custos extras.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="bg-stone-50 border-t border-stone-100 p-6 px-12 flex items-center justify-between gap-4">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0 || isSubmitting}
                    className="text-stone-400 hover:text-stone-800 hover:bg-transparent group h-12 font-bold text-[10px] uppercase tracking-widest disabled:opacity-0"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar
                </Button>

                {step === "confirm" ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!canGoNext || isSubmitting}
                        className="h-14 px-12 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Confirmando...
                            </div>
                        ) : "Finalizar Agendamento"}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className="h-14 px-12 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
                    >
                        Próximo
                        <ChevronRight size={16} className="ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}
