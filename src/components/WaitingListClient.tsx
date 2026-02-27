"use client";

import { useState, useMemo } from "react";
import { Search, CalendarHeart, Trash2, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { updateWaitingListStatus, deleteWaitingListEntry } from "@/lib/actions";

interface WaitingEntry {
    id: string;
    name: string;
    phone: string;
    preferredDays: string | null;
    preferredHours: string | null;
    specificDate: Date | string | null;
    specificTime: string | null;
    status: string;
    createdAt: Date | string;
}

interface WaitingListClientProps {
    initialList: WaitingEntry[];
}

export function WaitingListClient({ initialList }: WaitingListClientProps) {
    const [list, setList] = useState(initialList);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim();
        return list.filter(entry =>
            entry.name.toLowerCase().includes(query) ||
            entry.phone.includes(query)
        );
    }, [list, search]);

    const handleStatus = async (id: string, newStatus: string) => {
        try {
            await updateWaitingListStatus(id, newStatus);
            setList(list.map(e => e.id === id ? { ...e, status: newStatus } : e));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover da lista de espera?")) return;
        try {
            await deleteWaitingListEntry(id);
            setList(list.filter(e => e.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 p-2 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="flex flex-1 items-center gap-2 px-4 w-full">
                    <Search className="text-stone-300 pointer-events-none" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none text-sm font-medium text-stone-600 placeholder:text-stone-300 w-full h-10"
                    />
                </div>
            </div>

            {/* Grid Table */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-stone-50/30 border-b border-stone-100">
                            <tr>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Paciente</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Preferências</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 text-center">Inscrição</th>
                                <th className="py-4 px-8 text-left font-black text-[10px] uppercase tracking-[0.2em] text-stone-400 text-center">Status</th>
                                <th className="py-4 px-8 text-right font-black text-[10px] uppercase tracking-[0.2em] text-stone-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filtered.length > 0 ? filtered.map((entry, idx) => (
                                <tr key={entry.id} className={cn(
                                    "hover:bg-stone-50/50 transition-all group",
                                    idx % 2 === 1 ? "bg-stone-50/10" : "bg-white"
                                )}>
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[1.2rem] bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm border border-stone-200/50 font-black text-[11px] uppercase tracking-widest">
                                                <CalendarHeart size={14} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800 tracking-tight">{entry.name}</h4>
                                                <p className="text-[10px] text-stone-400 font-mono italic">{entry.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {entry.specificDate ? (
                                                <div className="flex items-center gap-1.5 text-stone-900 font-bold group">
                                                    <div className="w-2 h-2 rounded-full bg-amber-400 group-hover:animate-ping" />
                                                    {format(new Date(entry.specificDate), "dd/MM")} às {entry.specificTime}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-stone-900 font-medium">
                                                        {entry.preferredDays || "Qualquer dia"}
                                                    </div>
                                                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                                                        {entry.preferredHours || "Qualquer turno"}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center text-[10px] text-stone-400 font-mono">
                                        {format(new Date(entry.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-center">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            entry.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                entry.status === 'NOTIFIED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    entry.status === 'BOOKED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        "bg-stone-50 text-stone-400 border-stone-100"
                                        )}>
                                            {entry.status === 'PENDING' ? 'Aguardando' :
                                                entry.status === 'NOTIFIED' ? 'Notificado' :
                                                    entry.status === 'BOOKED' ? 'Agendado' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`https://wa.me/55${entry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                                    `Olá ${entry.name}, o horário que você aguardava (${entry.specificDate ? format(new Date(entry.specificDate), "dd/MM") + " às " + entry.specificTime : (entry.preferredDays || "um horário")}) acaba de ser liberado no Equilíbrio! Gostaria de agendar? \n\nLink: equilibrium.com/agendar`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-stone-100 text-stone-400 hover:text-green-600 hover:bg-green-50 transition-all">
                                                    <MessageSquare size={12} />
                                                </Button>
                                            </a>
                                            <Button
                                                onClick={() => handleStatus(entry.id, 'BOOKED')}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-lg border-stone-100 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                            >
                                                <CheckCircle2 size={12} />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(entry.id)}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-lg border-stone-100 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center bg-stone-50/10">
                                        <CalendarHeart className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                                        <h5 className="text-xl font-light text-stone-400 tracking-tight">Lista de espera <span className="italic">vazia</span>.</h5>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
