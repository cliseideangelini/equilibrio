"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { 
    format, 
    addDays, 
    startOfToday, 
    setHours, 
    setMinutes,
} from "date-fns";
import { 
    getAvailableSlots, 
    createAppointment, 
    getPatientByPhone,
    loginPatient,
    registerPatient
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Clock, ChevronLeft, User, Phone, Lock, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SCHEDULE_CONFIG = {
    WINDOW_DAYS: 15,
};

interface SimpleBookingFormProps {
    availabilityRules: any[];
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
}

export default function SimpleBookingForm({ availabilityRules, patientName, patientPhone, patientEmail }: SimpleBookingFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    // Selection State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [modality, setModality] = useState<"ONLINE" | "PRESENCIAL">("ONLINE");

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedDate) {
            setSlotsLoading(true);
            setSelectedTime(null);
            getAvailableSlots(selectedDate.toISOString())
                .then(setAvailableSlots)
                .finally(() => setSlotsLoading(false));
        }
    }, [selectedDate]);

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) return;
        
        setLoading(true);
        try {
            const result = await createAppointment({
                name: patientName,
                phone: patientPhone,
                email: patientEmail,
                password: "SESSION_ACTIVE",
                date: selectedDate.toISOString(),
                time: selectedTime,
                type: modality
            });
            
            if (result.success) {
                toast.success("Agendamento realizado com sucesso!");
                router.push("/paciente/minha-agenda");
            } else {
                toast.error(result.error || "Erro ao realizar agendamento.");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao realizar agendamento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Header Estilo Imagem */}
            <header className="flex items-center justify-between mb-12 bg-[#94A694]/10 p-6 rounded-[2rem] border border-[#94A694]/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#94A694] flex items-center justify-center text-white font-serif italic text-xl">C</div>
                    <h1 className="text-xl font-light text-[#5A635A] tracking-tight">Cliseide <span className="opacity-40 mx-2">|</span> <span className="font-serif italic">Psicologia</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94A694]">{patientName}</p>
                        <p className="text-[8px] font-bold text-stone-400 italic">Sessão Autenticada e Segura</p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#94A694]/10 flex items-center justify-center text-[#94A694]">
                         <User size={20} />
                    </div>
                </div>
            </header>

            <h2 className="text-3xl md:text-5xl font-light text-stone-800 tracking-tight mb-12 text-center">Agendamento <span className="font-serif italic text-stone-500">de Consulta</span></h2>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
                
                {/* Coluna 1: Calendário */}
                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-stone-200/40 border border-stone-50 transition-transform hover:scale-[1.01] duration-500">
                    <div className="flex items-center justify-center mb-6">
                         <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={[
                                { before: startOfToday() },
                                { after: addDays(startOfToday(), SCHEDULE_CONFIG.WINDOW_DAYS) },
                                { dayOfWeek: [0, 6] }
                            ]}
                            locale={ptBR}
                        />
                    </div>
                </div>

                {/* Coluna 2: Modalidade e Horários */}
                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-stone-200/40 border border-stone-50 min-h-[480px] flex flex-col transition-transform hover:scale-[1.01] duration-500">
                    
                    {/* Modalidade Selector */}
                    <div className="mb-8">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-3 ml-1">Como deseja o atendimento?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setModality("ONLINE")}
                                className={cn(
                                    "flex items-center justify-center gap-2 h-14 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                                    modality === "ONLINE"
                                        ? "bg-[#94A694]/10 text-[#5A635A] border-[#94A694]"
                                        : "bg-stone-50 border-stone-100 text-stone-400 hover:bg-stone-100"
                                )}
                            >
                                <Video size={16} />
                                Online (Meet)
                            </button>
                            <button
                                type="button"
                                onClick={() => setModality("PRESENCIAL")}
                                className={cn(
                                    "flex items-center justify-center gap-2 h-14 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                                    modality === "PRESENCIAL"
                                        ? "bg-[#94A694]/10 text-[#5A635A] border-[#94A694]"
                                        : "bg-stone-50 border-stone-100 text-stone-400 hover:bg-stone-100"
                                )}
                            >
                                <MapPin size={16} />
                                Presencial
                            </button>
                        </div>
                    </div>

                    <h3 className="text-base font-light text-stone-800 mb-6 flex items-center gap-3 border-t border-stone-50 pt-6">
                        <Clock size={18} className="text-[#94A694]" />
                        Horários <span className="font-serif italic text-stone-400">disponíveis</span>
                    </h3>

                    {!selectedDate ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <Calendar size={40} className="text-stone-100 mb-4" />
                            <p className="text-stone-400 text-sm font-medium italic">Selecione uma data no calendário ao lado para ver os horários.</p>
                        </div>
                    ) : slotsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-[#94A694]" />
                        </div>
                    ) : availableSlots.length > 0 ? (
                        <div className="flex-1 flex flex-col">
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {availableSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={cn(
                                            "h-11 rounded-xl font-bold text-[13px] tracking-widest transition-all border border-transparent shadow-sm",
                                            selectedTime === time 
                                                ? "bg-[#94A694] text-white shadow-lg shadow-[#94A694]/20" 
                                                : "bg-[#F2E8DF]/50 text-[#8c786a] hover:bg-[#F2E8DF] hover:shadow-md"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-6 border-t border-stone-50">
                                <Button
                                    onClick={handleBooking}
                                    disabled={!selectedTime || loading}
                                    className="w-full h-14 rounded-xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#94A694]/20 transition-all disabled:opacity-30"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
                                </Button>
                                <p className="text-[8px] text-stone-400 mt-3 text-center uppercase tracking-widest font-black opacity-40">
                                    {modality === "ONLINE" ? "Sessão Online via Google Meet" : "Sessão Presencial no Consultório"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <Clock size={48} className="text-stone-100 mb-4" />
                            <p className="text-stone-400 font-medium italic">Infelizmente não há horários disponíveis para este dia.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer de Ajuda */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Dificuldades para agendar? <a href="https://wa.me/5519988275290" className="text-[#94A694] underline">Fale conosco no WhatsApp</a></p>
            </div>
        </div>
    );
}
