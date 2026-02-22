"use client";

import { useState, useEffect, useTransition } from "react";
import { format, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { getAvailableSlots, createAppointment } from "@/lib/actions";
import {
    CheckCircle2,
    Loader2,
    Monitor,
    Building2,
    Clock,
    User,
    Phone,
    Mail,
    CalendarDays,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingForm() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [appointmentType, setAppointmentType] = useState<"ONLINE" | "PRESENCIAL">("PRESENCIAL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Checar se já está logado
    useEffect(() => {
        const patientId = document.cookie.split('; ').find(row => row.startsWith('patient_id='))?.split('=')[1];
        if (patientId) {
            setIsLoggedIn(true);
            const savedName = localStorage.getItem('patient_name');
            const savedPhone = localStorage.getItem('patient_phone');
            if (savedName) setName(savedName);
            if (savedPhone) setPhone(savedPhone);
            setPassword("SESSION_ACTIVE");
        }
    }, []);

    // Buscar horários quando a data mudar
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

            // Redireciona diretamente para a agenda
            window.location.href = '/paciente/minha-agenda';

        } catch (err: any) {
            console.error(err);
            alert("Erro de comunicação com o servidor. Tente novamente.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-[auto_1fr] gap-12">
            {/* Calendário */}
            <div className="bg-white rounded-[2.5rem] border border-sage-100 shadow-xl shadow-sage-50/50 p-8 h-fit">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <CalendarDays size={14} /> 1. Escolha a data
                </h3>
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                    locale={ptBR}
                    modifiersStyles={{
                        selected: { backgroundColor: 'var(--primary)', color: 'white', borderRadius: '14px' },
                        today: { color: 'var(--primary)', fontWeight: 'bold' },
                    }}
                />
            </div>

            <div className="space-y-8">
                {/* Horários */}
                <div className="bg-white rounded-[2.5rem] border border-sage-100 shadow-xl shadow-sage-50/50 p-8">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Clock size={14} /> 2. Horários Disponíveis
                    </h3>

                    {!selectedDate ? (
                        <div className="py-12 text-center text-muted-foreground italic font-medium opacity-50">
                            Selecione uma data para ver os horários.
                        </div>
                    ) : isPending ? (
                        <div className="flex items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-primary" />
                            <span className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Buscando...</span>
                        </div>
                    ) : slots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {slots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                        "h-14 rounded-2xl text-sm font-black transition-all border-2",
                                        selectedSlot === slot
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                            : "bg-sage-50/30 border-transparent hover:border-primary/20 hover:bg-white text-foreground"
                                    )}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground italic font-medium opacity-50">
                            Indisponível para esta data.
                        </div>
                    )}
                </div>

                {/* Dados */}
                <div className="bg-white rounded-[2.5rem] border border-sage-100 shadow-xl shadow-sage-50/50 p-8">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <User size={14} /> 3. Confirme seus Dados
                    </h3>

                    {isLoggedIn ? (
                        <div className="bg-sage-50/50 p-6 rounded-3xl border border-primary/5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Logado como</p>
                                <p className="font-black text-lg text-primary">{name}</p>
                            </div>
                            <User className="text-primary/20" size={32} />
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest ml-2">Nome Completo</label>
                                <input
                                    className="w-full h-14 px-6 rounded-2xl bg-sage-50/30 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-sm"
                                    placeholder="Como quer ser chamado?"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest ml-2">WhatsApp</label>
                                <input
                                    className="w-full h-14 px-6 rounded-2xl bg-sage-50/30 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-sm"
                                    placeholder="(11) 99999-9999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest ml-2">Senha de Acesso</label>
                                <input
                                    type="password"
                                    className="w-full h-14 px-6 rounded-2xl bg-sage-50/30 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-bold text-sm"
                                    placeholder="4 ou + números"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Finalização */}
                <div className="bg-primary text-white rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20">
                    <div>
                        <div className="flex gap-4 mb-4">
                            <button onClick={() => setAppointmentType("ONLINE")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", appointmentType === "ONLINE" ? "bg-white text-primary border-white" : "border-white/20 hover:bg-white/10")}>💻 Online</button>
                            <button onClick={() => setAppointmentType("PRESENCIAL")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", appointmentType === "PRESENCIAL" ? "bg-white text-primary border-white" : "border-white/20 hover:bg-white/10")}>🏢 Presencial</button>
                        </div>
                        <p className="text-2xl font-black italic tracking-tight">
                            {selectedDate ? format(selectedDate, "dd/MM") : "—"} ás {selectedSlot || "—"}
                        </p>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="h-16 px-12 rounded-[1.5rem] bg-white text-primary hover:bg-sage-50 font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-50"
                    >
                        {isSubmitting ? "Agendando..." : "Confirmar Agora"}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.2em] opacity-30 mt-8 italic">
                    ⚠️ Cancelamentos com menos de 3h de antecedência terão a sessão cobrada.
                </p>
            </div>
        </div>
    );
}
