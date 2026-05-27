import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Mail,
  HeartHandshake
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-32 pb-32 pt-24 overflow-hidden">
      {/* 15-day Window Banner (Floating Pill) */}
      <div className="w-full flex justify-center animate-in slide-in-from-top duration-700 fade-in px-4">
        <div className="glass-panel px-6 py-2.5 rounded-full flex items-center gap-3">
          <Clock size={16} className="text-primary animate-pulse" />
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
            Nossa agenda é liberada quinzenalmente
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-bold text-primary mb-8 animate-fade-in shadow-glass-sm border-white/60">
                <Sparkles className="w-4 h-4" />
                <span>Espaço clínico de acolhimento</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-foreground leading-[1.05] mb-8">
                Encontre o <br className="hidden lg:block"/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400 italic pr-4">
                  equilíbrio
                </span>
                interior.
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Psicoterapia baseada em evidências para te ajudar a navegar por desafios emocionais e construir uma vida com mais significado.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link href="/agendar">
                  <Button size="lg" className="h-16 px-10 rounded-full text-lg shadow-glass-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 duration-300">
                    Agendar Consulta
                    <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#sobre">
                  <Button variant="ghost" size="lg" className="h-16 px-8 rounded-full text-lg font-semibold hover:bg-white/50 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/40">
                    Conhecer a clínica
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-lg mx-auto">
              <div className="aspect-square relative glass-panel rounded-[3rem] overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent z-10" />
                <div className="w-full h-full bg-sage-100/50 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                  <HeartHandshake size={140} className="text-primary/20 absolute -right-10 -bottom-10 rotate-12" />
                  <UserIcon size={120} className="text-primary/40 relative z-20" />
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 glass-panel p-5 rounded-3xl animate-bounce-slow shadow-glass-lg flex items-center gap-4 border-white/60">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Flexibilidade</p>
                  <p className="text-xs text-muted-foreground font-medium">Online e Presencial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="container mx-auto px-6">
        <div className="glass-panel p-10 lg:p-16 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/40 text-xs font-bold uppercase tracking-wider text-primary mb-6">
                Sobre a Profissional
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Cliseide S. Angelini</h2>
              <p className="text-primary font-bold mb-8 text-lg">CRP 123230 | Psicóloga Clínica Especialista em TCC</p>
              
              <div className="space-y-6 text-foreground/80 text-lg leading-relaxed font-medium">
                <p>
                  A terapia é um processo colaborativo, no qual trabalhamos juntos para compreender e reestruturar seus padrões de pensamento e comportamento.
                </p>
                <p>
                  Por meio de técnicas da Terapia Cognitivo-Comportamental (TCC), apresento e ofereço ferramentas práticas, seguras e eficazes, com embasamento científico que comprova seus resultados, além de acolhimento humano e respeito à subjetividade de cada paciente.
                </p>
                <p>
                  Tenho atuado na área clínica desde 2015, atendendo crianças, adolescentes, adultos e idosos, além de realizar terapia de casal e avaliação psicológica.
                </p>
                <p className="text-primary font-bold text-xl pt-4">
                  Venha conhecer o meu trabalho e desenvolver o melhor de si.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass p-8 rounded-3xl border-white/60 hover:shadow-glass-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Abordagem TCC</h4>
                    <p className="text-muted-foreground font-medium">Especialista em Terapia Cognitivo-Comportamental, focada em resultados práticos e evidências.</p>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-white/60 hover:shadow-glass-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-3">Principais Formações</h4>
                    <ul className="space-y-2 text-muted-foreground font-medium text-sm">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Bacharel em Psicologia</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Especialização em Terapia Cognitivo-Comportamental</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Pós-graduada em Psicopedagogia</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Formação em Psico-Oncologia</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Capacitação Nacional em Psicologia do Trânsito</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"/> Pós-graduanda em Neuropsicologia e outros</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="servicos" className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/40 text-xs font-bold uppercase tracking-wider text-primary mb-6">
            Jornada do Paciente
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Como funciona o atendimento?</h2>
          <p className="text-muted-foreground text-xl font-medium">Inicie sua jornada de cuidado em apenas três passos fluidos e intuitivos.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              title: "1. Agendamento",
              desc: "Escolha o melhor dia e horário diretamente pela nossa plataforma inteligente, 100% online."
            },
            {
              icon: ShieldCheck,
              title: "2. Confirmação",
              desc: "Você receberá no seu e-mail e WhatsApp os detalhes seguros para o nosso encontro."
            },
            {
              icon: MessageCircle,
              title: "3. Consulta",
              desc: "Realizamos a sessão via plataforma criptografada (Google Meet) ou presencialmente no consultório."
            }
          ].map((step, i) => (
            <div key={i} className="glass-panel p-10 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500 group border-white/60">
              <div className="w-24 h-24 bg-white rounded-full shadow-glass-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 mb-8 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <step.icon size={36} className="relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Contato */}
      <section id="contato" className="container mx-auto px-6">
        <div className="glass-panel p-8 md:p-16 lg:p-20 rounded-[3rem] border-white/60">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/40 text-xs font-bold uppercase tracking-wider text-primary mb-6">
                Suporte & Dúvidas
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Estamos aqui para ouvir você.</h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium">
                Deseja tirar alguma dúvida pontual antes de agendar? Minha equipe e eu estamos à disposição para te acolher da melhor forma possível.
              </p>

              <div className="space-y-6">
                <a href="https://wa.me/5519988275290" className="flex items-center gap-6 glass p-6 rounded-[2rem] hover:shadow-glass-lg transition-all duration-300 group border-white/60">
                  <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="font-black text-2xl text-foreground">(19) 98827-5290</p>
                  </div>
                </a>
                <div className="flex items-center gap-6 glass p-6 rounded-[2rem] border-white/60">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">E-mail</p>
                    <p className="font-black text-xl text-foreground">Cliseideangelini@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-black mb-8">Dúvidas Frequentes</h3>
              <div className="space-y-4">
                {[
                  { q: "Quanto tempo dura cada sessão?", a: "As sessões têm duração aproximada de 30 a 50 minutos, variando conforme a necessidade." },
                  { q: "Quais são as regras para cancelamento?", a: "Cancelamentos devem ser feitos com no mínimo 3 horas de antecedência, ou a sessão será cobrada normalmente." },
                  { q: "Qual o valor e formas de pagamento?", a: "Aceitamos Pix, Cartão de Crédito e Transferência. Valores informados no agendamento." },
                  { q: "Atende convênios médicos?", a: "Atendimentos particulares, porém emitimos recibo para solicitação de reembolso no seu convênio." },
                ].map((item, i) => (
                  <div key={i} className="glass p-6 rounded-[1.5rem] border-white/50 hover:bg-white/80 transition-colors">
                    <h4 className="font-bold text-lg mb-2">{item.q}</h4>
                    <p className="text-muted-foreground font-medium">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-6">
        <div className="bg-foreground rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center text-white shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 tracking-tight">Pronto para dar o primeiro passo?</h2>
          <p className="text-white/70 text-xl md:text-2xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">
            A saúde mental é um investimento contínuo. Agende sua primeira sessão e sinta a diferença do acolhimento profissional.
          </p>
          <Link href="/agendar">
            <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold bg-white text-foreground hover:bg-white/90 shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
              Agendar Consulta Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/5519988275290"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="absolute right-full mr-4 bg-white/90 backdrop-blur-md text-foreground px-4 py-2 rounded-2xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/50">
          Como posso te ajudar?
        </span>
        <MessageCircle size={32} />
      </a>
    </div>
  );
}

function UserIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
