"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Loader2, Search, Calendar, Clock, Video, MapPin } from "lucide-react";
import { createManualAppointment } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
    id: string;
    name: string;
    phone: string;
}

interface ManualBookingDialogProps {
    patients: Patient[];
}

export function ManualBookingDialog({ patients }: ManualBookingDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [time, setTime] = useState("09:00");
    const [type, setType] = useState<"ONLINE" | "PRESENCIAL">("ONLINE");

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
    ).slice(0, 5);

    const handleBooking = async () => {
        if (!selectedPatientId) return alert("Selecione um paciente");

        setIsPending(true);
        try {
            const appointmentDate = new Date(`${date}T${time}:00`);
            await createManualAppointment({
                patientId: selectedPatientId,
                date: appointmentDate,
                type
            });
            setIsOpen(false);
            setSelectedPatientId(null);
            setSearch("");
        } catch (error) {
            console.error(error);
            alert("Erro ao agendar consulta.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 px-8 rounded-2xl bg-stone-900 border-0 text-white hover:bg-stone-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-stone-200 gap-2">
                    <PlusCircle size={14} /> Novo Agendamento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8 border-stone-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-stone-900 tracking-tight">
                        Novo <span className="italic font-serif text-stone-500">Agendamento</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Paciente */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Selecionar Paciente</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Nome ou telefone..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (selectedPatientId) setSelectedPatientId(null);
                                }}
                                className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 transition-all"
                            />
                        </div>

                        {search && !selectedPatientId && (
                            <div className="bg-white border border-stone-100 rounded-2xl shadow-lg mt-2 overflow-hidden max-h-48 overflow-y-auto z-10">
                                {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPatientId(p.id);
                                            setSearch(p.name);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 flex flex-col"
                                    >
                                        <span className="text-sm font-bold text-stone-800">{p.name}</span>
                                        <span className="text-[10px] text-stone-400 font-mono">{p.phone}</span>
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-sm text-stone-400 italic">Nenhum paciente encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Data e Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4 pointer-events-none" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Hora</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4 pointer-events-none" />
                                <input
                                    type="time"
                                    step="1800"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-stone-100 transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modalidade */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Modalidade</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setType("ONLINE")}
                                className={cn(
                                    "h-12 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                    type === "ONLINE"
                                        ? "bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200"
                                        : "bg-white border-stone-100 text-stone-400 hover:border-stone-300"
                                )}
                            >
                                <Video size={14} /> Online
                            </button>
                            <button
                                onClick={() => setType("PRESENCIAL")}
                                className={cn(
                                    "h-12 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                    type === "PRESENCIAL"
                                        ? "bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200"
                                        : "bg-white border-stone-100 text-stone-400 hover:border-stone-300"
                                )}
                            >
                                <MapPin size={14} /> Presencial
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleBooking}
                        disabled={isPending || !selectedPatientId}
                        className="w-full h-14 rounded-2xl bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl shadow-stone-100 mt-4"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
