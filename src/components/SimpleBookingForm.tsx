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
    loginPatient
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Clock, ChevronLeft, User, Phone, Lock, Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SCHEDULE_CONFIG = {
    WINDOW_DAYS: 15,
};

export default function SimpleBookingForm() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Phone Check, 1.1: Register, 1.2: Login, 2: Selection
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isExistingPatient, setIsExistingPatient] = useState(false);

    // Selection State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    // Handle initial patient check by phone
    const handleCheckPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error("Preencha seu telefone corretamente.");
            return;
        }
        setLoading(true);
        try {
            const patient = await getPatientByPhone(phone);
            if (patient) {
                setIsExistingPatient(true);
                setName(patient.name);
                setStep(1.2); // Go to Login
            } else {
                setIsExistingPatient(false);
                setStep(1.1); // Go to Registration
            }
        } catch (error) {
            toast.error("Erro ao verificar cadastro.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error("Preencha todos os campos.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }
        if (password.length < 4) {
            toast.error("A senha deve ter pelo menos 4 dígitos.");
            return;
        }
        setStep(2); // Valid registration data, move to calendar
    };

    const handleLoginStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await loginPatient(phone, password);
            if (result.success) {
                setName(result.name);
                setStep(2);
            } else {
                toast.error(result.error || "Senha incorreta.");
            }
        } catch (error) {
            toast.error("Erro ao realizar login.");
        } finally {
            setLoading(false);
        }
    };

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
            await createAppointment({
                name,
                phone,
                email: email || undefined,
                password: isExistingPatient ? "SESSION_ACTIVE" : password,
                date: selectedDate.toISOString(),
                time: selectedTime,
                type: "ONLINE"
            });
            
            toast.success("Agendamento realizado com sucesso!");
            router.push("/paciente/minha-agenda");
        } catch (error: any) {
            toast.error(error.message || "Erro ao realizar agendamento.");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Initial Phone Entry
    if (step === 1) {
        return (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Seja bem-vindo</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Inicie informando seu WhatsApp</p>
                    </div>
                    
                    <form onSubmit={handleCheckPatient} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">WhatsApp</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-stone-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Continuar <ArrowRight size={14} /></>}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Step 1.1: Detailed Registration
    if (step === 1.1) {
        return (
            <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <button onClick={() => setStep(1)} className="mb-6 text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <ChevronLeft size={14} /> Voltar
                    </button>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Criar sua conta</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Preencha seus dados para agendar</p>
                    </div>
                    
                    <form onSubmit={handleRegisterStep} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="h-12 pl-12 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Senha</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <Input 
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••"
                                        className="h-12 pl-10 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Confirmar</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                    <Input 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••"
                                        className="h-12 pl-10 rounded-xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-stone-200 transition-all mt-4"
                        >
                            Ver Horários Disponíveis
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // Step 1.2: Login for Existing Patient
    if (step === 1.2) {
        return (
            <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <button onClick={() => setStep(1)} className="mb-6 text-stone-400 hover:text-stone-800 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <ChevronLeft size={14} /> Voltar
                    </button>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Olá, {name.split(' ')[0]}!</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Informe sua senha para agendar</p>
                    </div>
                    
                    <form onSubmit={handleLoginStep} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Sua Senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                                <Input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-stone-100 bg-stone-50/50 focus:ring-[#94A694]/20"
                                    required
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-[#94A694] hover:bg-[#839583] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-stone-200 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Acessar Agenda"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/recuperar-senha" size="sm" className="text-[10px] font-bold text-[#94A694] hover:underline uppercase tracking-widest opacity-60">
                            Esqueceu a senha?
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Calendar Selection
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Header Estilo Imagem */}
            <header className="flex items-center justify-between mb-12 bg-[#94A694]/10 p-6 rounded-[2rem] border border-[#94A694]/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#94A694] flex items-center justify-center text-white font-serif italic text-xl">C</div>
                    <h1 className="text-xl font-light text-[#5A635A] tracking-tight">Cliseide <span className="opacity-40 mx-2">|</span> <span className="font-serif italic">Psicologia</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#94A694]">{name}</p>
                        <p className="text-[8px] font-bold text-stone-400 italic">Identidade Verificada</p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-stone-100">
                         <div className="w-full h-full flex items-center justify-center text-stone-300"><User size={20} /></div>
                    </div>
                </div>
            </header>

            <h2 className="text-3xl md:text-5xl font-light text-stone-800 tracking-tight mb-12 text-center">Agendamento <span className="font-serif italic text-stone-500">a psicologia</span></h2>

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

                {/* Coluna 2: Horários */}
                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-stone-200/40 border border-stone-50 min-h-[480px] flex flex-col transition-transform hover:scale-[1.01] duration-500">
                    <h3 className="text-base font-light text-stone-800 mb-6 flex items-center gap-3">
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
                                <p className="text-[8px] text-stone-400 mt-3 text-center uppercase tracking-widest font-black opacity-40">Sessão Online via Google Meet</p>
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
