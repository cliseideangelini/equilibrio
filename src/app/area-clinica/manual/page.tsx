"use client";

import Image from "next/image";
import { BookOpen, Calendar, Users, FileText, Clock, Settings, Sparkles, MessageCircle } from "lucide-react";

export default function ManualPage() {
    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                    <BookOpen size={14} />
                    <span>Central de Ajuda</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient mb-4">
                    Manual do Sistema
                </h1>
                <p className="text-muted-fg text-lg max-w-2xl">
                    Bem-vinda ao seu sistema Equilíbrio. Abaixo você encontra um guia completo sobre todas as funcionalidades disponíveis para facilitar o seu dia a dia clínico.
                </p>
            </div>

            <div className="space-y-16">
                
                {/* 1. Visão Geral (Hoje) */}
                <section className="bg-surface/30 border border-border/50 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-700"></div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Visão Geral (Hoje)</h2>
                            </div>
                            <p className="text-muted-fg mb-6 leading-relaxed">
                                A aba <strong>Hoje</strong> é o seu painel de controle principal. Aqui você tem um resumo imediato de todos os atendimentos marcados para o dia atual. 
                            </p>
                            <ul className="space-y-3 text-sm text-muted-fg">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>Visualize rapidamente quem são os pacientes do dia e os horários agendados.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>Acesso rápido ao WhatsApp e aos prontuários dos pacientes do dia.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                            <Image 
                                src="/manual_hoje.png" 
                                alt="Dashboard Hoje" 
                                fill 
                                className="object-cover object-left-top"
                                unoptimized
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Agenda */}
                <section className="bg-surface/30 border border-border/50 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors duration-700"></div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                            <Image 
                                src="/manual_agenda.png" 
                                alt="Agenda" 
                                fill 
                                className="object-cover object-left-top"
                                unoptimized
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                                    <Calendar size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
                            </div>
                            <p className="text-muted-fg mb-6 leading-relaxed">
                                Gerencie todo o seu calendário clínico de forma intuitiva. A Agenda permite um controle total sobre seus horários disponíveis.
                            </p>
                            <ul className="space-y-3 text-sm text-muted-fg">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <span>Agende novas consultas clicando nos horários vagos.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <span>Mova, edite ou cancele atendimentos facilmente.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <span>As consultas marcadas disparam automações no WhatsApp caso configuradas.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Pacientes */}
                <section className="bg-surface/30 border border-border/50 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                    <Users size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Pacientes</h2>
                            </div>
                            <p className="text-muted-fg mb-6 leading-relaxed">
                                A sua base de dados inteligente. Todos os perfis dos seus pacientes ficam centralizados aqui para buscas rápidas.
                            </p>
                            <ul className="space-y-3 text-sm text-muted-fg">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    <span>Cadastre novos pacientes com dados de contato, CPF, e informações vitais.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    <span>Utilize a barra de pesquisa para achar rapidamente qualquer cadastro.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    <span>Mantenha um controle financeiro e histórico de cada pessoa.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                            <Image 
                                src="/manual_pacientes.png" 
                                alt="Lista de Pacientes" 
                                fill 
                                className="object-cover object-left-top"
                                unoptimized
                            />
                        </div>
                    </div>
                </section>

                {/* Outras Funcionalidades (Grid Menor) */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Prontuários */}
                    <div className="bg-surface/40 border border-border/50 rounded-3xl p-6 backdrop-blur-md">
                        <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 w-max mb-4">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Prontuários</h3>
                        <p className="text-sm text-muted-fg leading-relaxed">
                            O coração do acompanhamento clínico. Registre a evolução, anotações de cada sessão, anexe documentos e mantenha o histórico terapêutico de forma segura e organizada.
                        </p>
                    </div>

                    {/* Lista de Espera */}
                    <div className="bg-surface/40 border border-border/50 rounded-3xl p-6 backdrop-blur-md">
                        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 w-max mb-4">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Lista de Espera</h3>
                        <p className="text-sm text-muted-fg leading-relaxed">
                            Não perca nenhum paciente por falta de horário. Adicione pessoas interessadas à lista de espera e, assim que um horário vagar, você terá para quem oferecer.
                        </p>
                    </div>

                    {/* Configurações & Bot */}
                    <div className="bg-surface/40 border border-border/50 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex gap-2 mb-4">
                            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400 w-max">
                                <Settings size={20} />
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-2xl text-green-400 w-max">
                                <MessageCircle size={20} />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Config & WhatsApp</h3>
                        <p className="text-sm text-muted-fg leading-relaxed">
                            No menu Configurações você altera suas preferências. O sistema também possui um robô de WhatsApp integrado para enviar lembretes. Fique de olho no indicador "Online" no topo da página.
                        </p>
                    </div>
                </div>

            </div>
            
            <div className="mt-16 text-center">
                <p className="text-muted-fg text-sm">
                    Desenvolvido com excelência para <span className="font-serif text-gradient font-bold text-base">Equilíbrio</span>
                </p>
            </div>
        </div>
    );
}
