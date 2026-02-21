"use client";

export const dynamic = "force-dynamic";

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

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [appointmentType, setAppointmentType] = useState<"ONLINE" | "PRESENCIAL">("ONLINE");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [meetLink, setMeetLink] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Checar se já está logado para facilitar o agendamento
    useEffect(() => {
        const patientId = document.cookie.split('; ').find(row => row.startsWith('patient_id='))?.split('=')[1];
        if (patientId) {
            setIsLoggedIn(true);
            // Poderíamos buscar o nome/fone do paciente aqui via action, mas para o MVP
            // vamos deixar ele digitar uma vez ou herdar se tivermos salvo no localStorage
            const savedName = localStorage.getItem('patient_name');
            const savedPhone = localStorage.getItem('patient_phone');
            if (savedName) setName(savedName);
            if (savedPhone) setPhone(savedPhone);
            // Senha não é necessária se já estiver logado (o backend cuidará disso)
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

    const canSubmit = selectedDate && selectedSlot && name.trim() && phone.trim() && password.length >= 4;

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
            // Salvar para agilizar próximos
            localStorage.setItem('patient_name', name);
            localStorage.setItem('patient_phone', phone);
            setMeetLink(result.meetLink ?? null);
            setSuccess(true);
        } catch (err: any) {
            alert(err.message || "Erro ao agendar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mensagem WA pre-formatada (só calculada quando temos data e horário)
    const waText = selectedDate && selectedSlot ? encodeURIComponent(
        `Olá, Dra. Cliseide! Acabei de agendar uma sessão:\n\n📅 *${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}* às *${selectedSlot}*\n🖼️ Formato: *${appointmentType === "ONLINE" ? "Online (Google Meet)" : "Presencial"}*${meetLink ? `\n🔗 Link: ${meetLink}` : ""}\n\nMeu nome: ${name}\nTelefone: ${phone}\n\nAguardo a confirmação! 🙏`
    ) : "";

    // Tela de sucesso
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-20">
                <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-sage-100 flex flex-col items-center text-center max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-3">Tudo certo!</h1>
                    <p className="text-muted-foreground mb-2">
                        Sessão solicitada para <strong>{format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })}</strong> às <strong>{selectedSlot}</strong>.
                    </p>

                    {meetLink && (
                        <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 my-4 text-left">
                            <p className="text-sm font-bold text-blue-800 mb-1">🖥️ Link do Google Meet</p>
                            <a
                                href={meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-sm underline break-all"
                            >
                                {meetLink}
                            </a>
                            <p className="text-xs text-blue-600 mt-2">Este link foi adicionado automaticamente à agenda da Dra. Cliseide.</p>
                        </div>
                    )}

                    <p className="text-sm text-muted-foreground mb-8">
                        O lembrete automático será enviado 3h antes da sessão.
                    </p>
                    <div className="flex gap-3 w-full">
                        <a href="/" className="flex-1">
                            <button className="w-full h-11 rounded-xl border text-sm font-medium hover:bg-sage-50 transition-colors">
                                Voltar ao site
                            </button>
                        </a>
                        <a
                            href={`https://wa.me/5519988275290?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <button className="w-full h-11 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#22c55e] transition-colors">
                                📲 Enviar pelo WhatsApp
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sage-50/30 pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Agendamento inteligente
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Agende sua sessão</h1>
                    <p className="text-muted-foreground">Escolha o formato, a data e o horário que melhor se encaixam na sua rotina.</p>
                </div>

                {/* Tipo de Atendimento */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white border rounded-2xl p-1.5 inline-flex gap-1.5 shadow-sm">
                        <button
                            onClick={() => setAppointmentType("ONLINE")}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                appointmentType === "ONLINE"
                                    ? "bg-primary text-white shadow-md"
                                    : "text-muted-foreground hover:bg-sage-50"
                            )}
                        >
                            <Monitor size={16} />
                            Online
                        </button>
                        <button
                            onClick={() => setAppointmentType("PRESENCIAL")}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                appointmentType === "PRESENCIAL"
                                    ? "bg-primary text-white shadow-md"
                                    : "text-muted-foreground hover:bg-sage-50"
                            )}
                        >
                            <Building2 size={16} />
                            Presencial
                        </button>
                    </div>
                </div>

                {/* Layout principal */}
                <div className="grid lg:grid-cols-[auto_1fr] gap-8">

                    {/* Calendário */}
                    <div className="bg-white rounded-3xl border shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CalendarDays size={14} />
                            Escolha a data
                        </h3>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={[
                                { before: startOfToday() },
                                { dayOfWeek: [0, 6] }
                            ]}
                            locale={ptBR}
                            modifiersStyles={{
                                selected: { backgroundColor: 'var(--primary)', color: 'white', borderRadius: '10px' },
                                today: { border: '2px solid var(--primary)', borderRadius: '10px', opacity: 0.7 },
                            }}
                        />
                    </div>

                    {/* Horários + Formulário */}
                    <div className="space-y-6">

                        {/* Horários disponíveis */}
                        <div className="bg-white rounded-3xl border shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock size={14} />
                                {selectedDate
                                    ? `Horários para ${format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}`
                                    : "Selecione uma data ao lado"}
                            </h3>

                            {!selectedDate ? (
                                <p className="text-muted-foreground text-sm italic py-6 text-center">
                                    Selecione uma data no calendário para ver os horários disponíveis.
                                </p>
                            ) : isPending ? (
                                <div className="flex items-center justify-center gap-3 py-10">
                                    <Loader2 className="animate-spin text-primary w-5 h-5" />
                                    <span className="text-sm text-muted-foreground">Carregando horários...</span>
                                </div>
                            ) : slots.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={cn(
                                                "h-11 rounded-xl text-sm font-semibold border transition-all duration-150",
                                                selectedSlot === slot
                                                    ? "bg-primary text-white border-primary shadow-md scale-105"
                                                    : "bg-white border-input hover:border-primary/40 hover:bg-sage-50 text-foreground"
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-8 text-muted-foreground text-sm italic">
                                    Nenhum horário disponível para esta data.
                                </p>
                            )}
                        </div>

                        {/* Formulário do paciente */}
                        <div className="bg-white rounded-3xl border shadow-sm p-6 text-center">
                            {isLoggedIn ? (
                                <div className="py-4">
                                    <h3 className="text-lg font-bold text-primary mb-1">Agendando como {name || 'Paciente'}</h3>
                                    <p className="text-xs text-muted-foreground italic">Seus dados já estão vinculados à sua conta ativa.</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User size={14} />
                                        Seus dados
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4 text-left">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Nome*</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="Seu nome completo"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">WhatsApp*</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="tel"
                                                    required
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="(00) 00000-0000"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">E-mail (opcional)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="email"
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="seu@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Defina uma senha*</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    placeholder="Mínimo 4 caracteres"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Resumo + botão de confirmação */}
                        <div className="bg-white rounded-3xl border shadow-sm p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                    <span className="text-muted-foreground">
                                        {appointmentType === "ONLINE" ? "💻 Online" : "🏢 Presencial"}
                                    </span>
                                    <span className="text-muted-foreground">
                                        📅 {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "—"}
                                    </span>
                                    <span className="text-muted-foreground">
                                        🕐 {selectedSlot || "—"}
                                    </span>
                                    <span className="text-muted-foreground">
                                        ⏱️ 30 min
                                    </span>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 text-base shrink-0 w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 animate-spin w-4 h-4" /> Agendando...</>
                                    ) : (
                                        "Confirmar Agendamento"
                                    )}
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-3 italic">
                                ⚠️ Cancelamentos com menos de 3h de antecedência terão a sessão cobrada.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
