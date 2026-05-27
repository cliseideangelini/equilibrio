import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, Brain, Heart, Shield, Clock, Phone, MapPin, Sparkles, MoveRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-obsidian">
            
            {/* Cinematic Aurora Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-emeraldGlow-500/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-champagne-500/10 blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* HERO SECTION */}
            <section className="relative z-10 min-h-screen flex items-center justify-center pt-20 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                    
                    <div className="flex flex-col gap-8 animate-fade-in">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emeraldGlow-500/30 bg-emeraldGlow-500/10 backdrop-blur-md w-fit">
                            <Sparkles className="w-4 h-4 text-emeraldGlow-400" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-emeraldGlow-400">Psicologia Clínica Premium</span>
                        </div>
                        
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif text-white leading-[1.1] tracking-tight">
                            Encontre <br />
                            o seu <span className="text-emeraldGlow-400 italic">Equilíbrio.</span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl font-light leading-relaxed">
                            Uma abordagem de alto padrão em Terapia Cognitivo-Comportamental. Redescubra sua força interior através de um processo clínico imersivo, focado na sua melhor versão.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <Link href="/agendar">
                                <Button size="lg" className="glass-glow h-16 px-10 text-xs tracking-[0.2em] uppercase font-bold text-white hover:bg-emeraldGlow-500/20 hover:scale-105 transition-all duration-500 group w-full sm:w-auto">
                                    Agendar Sessão
                                    <MoveRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/#sobre">
                                <Button size="lg" variant="ghost" className="h-16 px-10 text-xs tracking-[0.2em] uppercase font-bold text-muted-foreground hover:text-white rounded-full transition-colors w-full sm:w-auto">
                                    Conhecer Mais
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative h-[60vh] lg:h-[80vh] w-full rounded-[3rem] overflow-hidden glass-panel border-white/5 animate-fade-in delay-300 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-transparent z-10" />
                        <Image 
                            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop"
                            alt="Equilíbrio Clínica"
                            fill
                            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute bottom-10 left-10 z-20 glass p-6 rounded-[2rem] max-w-sm border-white/10 backdrop-blur-3xl">
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 text-champagne-400 fill-champagne-400" />)}
                            </div>
                            <p className="text-sm text-white/90 font-medium italic">
                                "O ambiente mais acolhedor e a metodologia mais eficaz que já experimentei."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENTO BOX GRID: SOBRE & SERVIÇOS */}
            <section id="sobre" className="relative z-10 py-32 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto space-y-32">
                    
                    {/* BENTO GRID 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Box 1: A Profissional */}
                        <div className="glass-panel p-10 md:col-span-2 group hover:border-emeraldGlow-500/30 transition-colors duration-500">
                            <h2 className="text-4xl font-serif text-white mb-6">Cliseide S. Angelini</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                                A terapia é um processo colaborativo, onde trabalhamos juntos para compreender e reestruturar seus padrões de pensamento e comportamento. Por meio de técnicas da TCC, ofereço ferramentas práticas, seguras e eficazes, unindo embasamento científico e acolhimento humano.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <span className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-champagne-300">Psicologia</span>
                                <span className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-champagne-300">TCC</span>
                                <span className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-champagne-300">Psicopedagogia</span>
                            </div>
                        </div>

                        {/* Box 2: Experiência */}
                        <div className="glass-panel p-10 flex flex-col justify-center items-center text-center group hover:bg-white/5 transition-colors duration-500">
                            <span className="text-7xl font-serif text-emeraldGlow-400 mb-4">+9</span>
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/70">Anos de Experiência Clínica</span>
                        </div>

                        {/* Box 3: Foco */}
                        <div className="glass-panel p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
                            <Brain className="w-10 h-10 text-emeraldGlow-400 mb-8" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Terapia Individual</h3>
                                <p className="text-sm text-muted-foreground">Adolescentes, adultos e idosos buscando qualidade de vida.</p>
                            </div>
                        </div>

                        {/* Box 4: Casais */}
                        <div className="glass-panel p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
                            <Heart className="w-10 h-10 text-champagne-400 mb-8" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Terapia de Casal</h3>
                                <p className="text-sm text-muted-foreground">Mediação e construção de relacionamentos mais saudáveis.</p>
                            </div>
                        </div>

                        {/* Box 5: Avaliação */}
                        <div className="glass-panel p-10 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
                            <Shield className="w-10 h-10 text-blue-400 mb-8" />
                            <div>
                                <h3 className="text-xl font-bold text-white mb-3">Avaliação Psicológica</h3>
                                <p className="text-sm text-muted-foreground">Diagnósticos precisos com ferramentas validadas.</p>
                            </div>
                        </div>

                    </div>

                    {/* CTA FINAL IMERSIVO */}
                    <div className="relative w-full rounded-[4rem] overflow-hidden glass-glow p-16 sm:p-24 text-center border-emeraldGlow-500/50">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emeraldGlow-500/20 via-transparent to-transparent opacity-50" />
                        <h2 className="relative z-10 text-5xl sm:text-7xl font-serif text-white mb-8">
                            Sua jornada <br />começa aqui.
                        </h2>
                        <Link href="/agendar" className="relative z-10 inline-block">
                            <Button size="lg" className="h-16 px-12 text-xs tracking-[0.2em] uppercase font-bold text-obsidian bg-white hover:bg-champagne-300 rounded-full transition-colors duration-300">
                                Agendar Minha Consulta
                            </Button>
                        </Link>
                    </div>

                </div>
            </section>

            {/* RODAPÉ */}
            <footer className="border-t border-white/5 py-12 px-4 sm:px-8 bg-obsidian-900/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} className="invert opacity-50" />
                        <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/50">Equilíbrio Psicologia Clínica © 2026</span>
                    </div>
                    <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-white/30">
                        <Link href="/login" className="hover:text-white transition-colors">Área Clínica</Link>
                    </div>
                </div>
            </footer>

        </main>
    );
}
