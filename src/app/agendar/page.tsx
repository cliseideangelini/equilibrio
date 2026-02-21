"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAvailableSlots, createAppointment } from "@/lib/actions";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    Mail,
    Phone,
    CheckCircle2,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    // Buscar horários quando a data mudar
    useEffect(() => {
        if (selectedDate) {
            setLoadingSlots(true);
            setSelectedSlot(null);
            getAvailableSlots(selectedDate.toISOString())
                .then(setSlots)
                .finally(() => setLoadingSlots(false));
        }
    }, [selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;

        setIsSubmitting(true);
        try {
            await createAppointment({
                ...formData,
                date: selectedDate.toISOString(),
                time: selectedSlot
            });
            setSuccess(true);
            setStep(4);
        } catch (error) {
            alert("Erro ao realizar agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="container mx-auto px-6 pt-40 pb-20 max-w-2xl text-center">
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-sage-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-sage-100 text-primary rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Agendamento Realizado!</h1>
                    <p className="text-muted-foreground mb-8">
                        Sua solicitação enviada com sucesso. Você receberá uma confirmação em breve no seu WhatsApp e e-mail.
                    </p>
                    <Button asChild size="lg">
                        <a href="/">Voltar para o início</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold mb-2">Agende sua sessão</h1>
                <p className="text-muted-foreground">Escolha o melhor momento para caminharmos juntos.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                <div className="space-y-6">
                    {/* Step 1: Data */}
                    <Card className={cn("transition-opacity", step !== 1 && "opacity-50 pointer-events-none")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                1. Escolha a data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    if (date) setStep(2);
                                }}
                                disabled={{ before: startOfToday() }}
                                locale={ptBR}
                                className="mx-auto"
                                modifiersStyles={{
                                    selected: { backgroundColor: 'var(--primary)', color: 'white' }
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Step 2: Horário */}
                    <Card className={cn("transition-opacity", step !== 2 && "opacity-50 pointer-events-none")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                2. Horários disponíveis
                            </CardTitle>
                            <CardDescription>
                                {selectedDate ? format(selectedDate, "PPPP", { locale: ptBR }) : "Selecione uma data acima"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingSlots ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="animate-spin text-primary" />
                                </div>
                            ) : slots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {slots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            className="h-12"
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                setStep(3);
                                            }}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            ) : selectedDate ? (
                                <p className="text-center py-10 text-muted-foreground italic">
                                    Infelizmente não há mais horários disponíveis para este dia.
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>

                    {/* Step 3: Dados */}
                    <Card className={cn("transition-opacity", step !== 3 && "opacity-50 pointer-events-none")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                3. Seus dados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Ex: Maria Silva"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">E-mail</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <input
                                                required
                                                type="email"
                                                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                placeholder="maria@email.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">WhatsApp</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <input
                                                required
                                                type="tel"
                                                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                placeholder="(00) 00000-0000"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Resumo */}
                <div className="space-y-6">
                    <Card className="sticky top-24 bg-sage-50 border-sage-200">
                        <CardHeader>
                            <CardTitle>Resumo do Agendamento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Profissional:</span>
                                <span className="font-medium text-right">Cliseide S. Angelini</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duração:</span>
                                <span className="font-medium">50 minutos</span>
                            </div>
                            <div className="h-px bg-sage-200 my-2" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Data:</span>
                                <span className="font-medium italic">
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pendente"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Horário:</span>
                                <span className="font-medium italic">
                                    {selectedSlot ? selectedSlot : "Pendente"}
                                </span>
                            </div>

                            <Button
                                form="booking-form"
                                disabled={step !== 3 || isSubmitting}
                                className="w-full mt-6 h-12 text-base font-bold"
                            >
                                {isSubmitting && <Loader2 className="mr-2 animate-spin w-4 h-4" />}
                                Confirmar Agendamento
                            </Button>

                            {step > 1 && (
                                <Button
                                    variant="ghost"
                                    className="w-full gap-2 text-primary"
                                    onClick={() => setStep(prev => prev - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Voltar passo
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
