"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simplificado para esta versão (senha fixa da profissional)
        if (password === "cliseide2025") {
            document.cookie = "auth_token=cliseide_admin_session; path=/; max-age=86400";
            router.push("/admin");
        } else {
            setError("Senha incorreta. Tente novamente.");
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
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Área Clínica</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Acesse sua agenda e gestão de pacientes</CardDescription>
                </div>

                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Usuário</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="text"
                                    disabled
                                    value="cliseide.angelini"
                                    className="w-full h-12 rounded-xl border border-input bg-muted/50 px-12 text-muted-foreground outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="password"
                                    autoFocus
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-input bg-background px-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 group">
                            Entrar no Sistema
                            <ShieldCheck className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground italic">
                            Acesso exclusivo para Cliseide S. Angelini.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
