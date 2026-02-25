import prisma from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    Users,
    TrendingUp,
    ArrowRight,
    CalendarCheck,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AreaClinicaDashboard() {
    const today = new Date();

    // Stats
    const todayCount = await prisma.appointment.count({
        where: {
            startTime: {
                gte: startOfDay(today),
                lte: endOfDay(today),
            }
        }
    });

    const pendingCount = await prisma.appointment.count({
        where: { status: 'PENDING' }
    });

    const totalPatients = await prisma.patient.count();

    return (
        <div className="space-y-10">
            {/* Greetings */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900 leading-tight">Painel de Gestão Clínico</h1>
                    <p className="text-stone-500 font-medium italic mt-1">Bem-vinda de volta, Dra. Cliseide.</p>
                </div>
                <Link href="/area-clinica/agenda">
                    <Button className="h-11 rounded-xl px-8 bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-200 gap-2">
                        <CalendarCheck size={18} />
                        Agenda Completa
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-none bg-stone-900 text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Sessões Hoje</CardTitle>
                        <Calendar className="w-4 h-4 text-stone-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{todayCount}</div>
                        <p className="text-[10px] text-stone-500 mt-2 font-black uppercase tracking-widest leading-none">Status: Atualizado</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-stone-100 bg-white shadow-sm shadow-stone-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Prontuários Pendentes</CardTitle>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-stone-800">{pendingCount}</div>
                        <p className="text-[10px] text-stone-400 mt-2 font-black uppercase tracking-widest leading-none">Novas solicitações por confirmar</p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-stone-100 bg-white shadow-sm shadow-stone-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Total de Pacientes</CardTitle>
                        <Users className="w-4 h-4 text-stone-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-stone-800">{totalPatients}</div>
                        <p className="text-[10px] text-stone-400 mt-2 font-black uppercase tracking-widest leading-none">Base Geral de Prontuários</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100">
                    <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2 mb-8">
                        Resumo Semanal
                        <TrendingUp size={18} className="text-stone-400" />
                    </h3>
                    <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-[2rem]">
                        <p className="text-stone-300 italic font-medium">Relatório de produtividade em análise...</p>
                    </div>
                </section>

                <section className="bg-stone-100/50 p-8 rounded-[2.5rem] border border-stone-200/50 relative overflow-hidden group">
                    {/* Placeholder link or action */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Image src="/logo.png" alt="Logo" width={120} height={120} />
                    </div>

                    <h3 className="text-xl font-bold text-stone-800 mb-4">Novo Cadastro</h3>
                    <p className="text-sm text-stone-500 leading-relaxed max-w-[240px] mb-8 font-medium">Cadastre um novo paciente manualmente para iniciar um novo prontuário.</p>

                    <Button className="rounded-xl h-11 px-6 bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 shadow-sm gap-2">
                        Iniciar Cadastro
                        <ArrowRight size={14} />
                    </Button>
                </section>
            </div>
        </div>
    );
}
