"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Phone, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginPatient } from "@/lib/actions";

export default function PatientLoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setError("");

        try {
            const result = await loginPatient(phone, password);
            if (result.success) {
                document.cookie = `patient_id=${result.patientId}; path=/; max-age=86400`;
                router.push("/paciente/minha-agenda");
            } else {
                setError(result.error || "Erro ao entrar.");
            }
        } catch {
            setError("Algo deu errado. Verifique sua conexão.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sage-50 px-6 py-12">
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
                <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-sage-300 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-sage-200 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden">
                <div className="bg-primary p-8 text-center text-white relative">
                    <Link href="/" className="absolute left-6 top-8 text-white/80 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Portal do Paciente</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Gerencie seus agendamentos e histórico</CardDescription>
                </div>

                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">WhatsApp (com DDD)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full h-12 rounded-xl border border-input bg-background px-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Sua Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-input bg-background px-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 group">
                            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Acessar Portal"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Ainda não tem agendamento? <Link href="/agendar" className="text-primary font-bold hover:underline">Agende agora</Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
