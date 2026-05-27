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
import { Loader2, Calendar, Clock, ChevronLeft, User, Phone, Lock, Mail, ArrowRight, Video, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
            <header className="flex items-center justify-between mb-12 glass-card p-6 rounded-[2rem] border border-white/10 bg-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-primary/20 transition-colors shadow-dim">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain shrink-0 invert opacity-90" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif text-white tracking-tight">Equilíbrio <span className="opacity-40 mx-2 font-sans">|</span> <span className="font-sans text-sm uppercase tracking-widest text-primary font-bold">Agendamento</span></h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">{patientName}</p>
                        <p className="text-[8px] font-bold text-muted-foreground italic">Sessão Autenticada e Segura</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-sm">
                         <User size={20} />
                    </div>
                </div>
            </header>

            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight mb-12 text-center">Agendamento <span className="italic text-primary">de Consulta</span></h2>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                
                {/* Coluna 1: Calendário */}
                <div className="glass-card rounded-[3rem] p-8 border border-white/10 transition-transform hover:border-primary/30 duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none" />
                    <div className="flex items-center justify-center mb-6 relative z-10 dark-calendar-wrapper">
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
                            className="text-white"
                        />
                    </div>
                </div>

                {/* Coluna 2: Modalidade e Horários */}
                <div className="glass-card rounded-[3rem] p-8 border border-white/10 min-h-[480px] flex flex-col transition-transform hover:border-primary/30 duration-500 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-champagne-500/10 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-champagne-500/20 transition-all pointer-events-none" />
                    
                    <div className="relative z-10">
                        {/* Modalidade Selector */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3 ml-1">Como deseja o atendimento?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModality("ONLINE")}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-14 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border",
                                        modality === "ONLINE"
                                            ? "bg-primary/20 text-white border-primary shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Video size={16} className={modality === "ONLINE" ? "text-primary" : ""} />
                                    Online (Meet)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModality("PRESENCIAL")}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-14 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border",
                                        modality === "PRESENCIAL"
                                            ? "bg-champagne-500/20 text-white border-champagne-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <MapPin size={16} className={modality === "PRESENCIAL" ? "text-champagne-500" : ""} />
                                    Presencial
                                </button>
                            </div>
                        </div>

                        <h3 className="text-base font-serif text-white mb-6 flex items-center gap-3 border-t border-white/10 pt-6">
                            <Clock size={18} className="text-primary" />
                            Horários <span className="italic text-muted-foreground">disponíveis</span>
                        </h3>

                        {!selectedDate ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-8">
                                <Calendar size={40} className="text-white/10 mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">Selecione uma data no calendário ao lado para ver os horários.</p>
                            </div>
                        ) : slotsLoading ? (
                            <div className="flex-1 flex items-center justify-center mt-16">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="flex-1 flex flex-col">
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {availableSlots.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "h-12 rounded-xl font-bold text-sm tracking-widest transition-all border",
                                                selectedTime === time 
                                                    ? "bg-primary text-white border-primary shadow-glow" 
                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/10">
                                    <Button
                                        onClick={handleBooking}
                                        disabled={!selectedTime || loading}
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-glow hover:shadow-glow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-glow"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
                                    </Button>
                                    <p className="text-[9px] text-muted-foreground mt-4 text-center uppercase tracking-widest font-bold">
                                        {modality === "ONLINE" ? "Sessão Online via Google Meet" : "Sessão Presencial no Consultório"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 mt-8">
                                <Clock size={48} className="text-white/10 mb-4" />
                                <p className="text-muted-foreground font-medium">Infelizmente não há horários disponíveis para este dia.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Footer de Ajuda */}
            <div className="mt-12 text-center pb-12 relative z-20">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Dificuldades para agendar? <a href="https://wa.me/5519988275290" className="text-primary hover:text-white transition-colors">Fale conosco no WhatsApp</a>
                </p>
            </div>
        </div>
    );
}
