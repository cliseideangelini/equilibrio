import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Mail
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-sage-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-sage-200 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-sm font-medium mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                <span>Espaço de acolhimento e mudança</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                Encontre o seu <span className="text-primary italic">equilíbrio</span> interior.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Psicoterapia baseada em evidências para te ajudar a navegar por desafios emocionais e construir uma vida com mais significado.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/agendar">
                  <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/30">
                    Agendar Consulta
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#sobre">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-base">
                    Conhecer a profissional
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] mx-auto">
                <div className="absolute inset-0 bg-sage-200 rounded-2xl rotate-6 -z-10 transition-transform hover:rotate-3 duration-500" />
                <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl -rotate-3 -z-10" />
                <div className="w-full h-full bg-sage-100 rounded-2xl overflow-hidden shadow-2xl relative">
                  {/* Placeholder for photo */}
                  <div className="absolute inset-0 flex items-center justify-center text-sage-300">
                    <UserIcon size={120} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Cliseide S. Angelini</h2>
            <p className="text-primary font-medium mb-4">CRP 123230 | Psicóloga Clínica Especialista em TCC</p>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                Acredito que a terapia é um processo colaborativo, onde trabalhamos juntos para compreender seus padrões de pensamento e comportamento.
              </p>
              <p>
                Com especialização em Terapia Cognitivo-Comportamental (TCC), meu foco é oferecer ferramentas práticas e acolhimento humano para que você possa enfrentar a ansiedade, depressão, conflitos de relacionamento e outras questões que impactam sua qualidade de vida.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Abordagem TCC</h4>
                  <p className="text-sm">Focada em resultados e autoconhecimento.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-primary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold">Sigilo Total</h4>
                  <p className="text-sm">Ambiente seguro e ético conforme o CFP.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="bg-sage-50 p-8 rounded-3xl border border-sage-100">
              <h3 className="text-2xl font-bold mb-8">Destaques</h3>
              <div className="space-y-6">
                {[
                  { title: "Sessões Online e Presenciais", desc: "Flexibilidade para o seu dia a dia." },
                  { title: "+10 Anos de Experiência", desc: "Histórico de acolhimento e escuta ativa." },
                  { title: "Especialização em Ansiedade", desc: "Tratamento focado em demandas emocionais modernas." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="servicos" className="bg-sage-50/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Como funciona o atendimento?</h2>
            <p className="text-muted-foreground text-lg">Inicie sua jornada de cuidado em apenas três passos simples.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "1. Agendamento",
                desc: "Escolha o melhor dia e horário diretamente pela nossa plataforma inteligente."
              },
              {
                icon: ShieldCheck,
                title: "2. Confirmação",
                desc: "Você receberá por e-mail e WhatsApp os detalhes para o nosso encontro."
              },
              {
                icon: MessageCircle,
                title: "3. Consulta",
                desc: "Realizamos a sessão via plataforma segura (Google Meet) ou presencialmente."
              }
            ].map((step, i) => (
              <Card key={i} className="border-none shadow-none bg-transparent group">
                <CardContent className="pt-0 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 mb-6">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dúvidas Frequentes</h2>
          <p className="text-muted-foreground text-lg">Tudo o que você precisa saber sobre o processo terapêutico.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: "Quanto tempo dura cada sessão?",
              a: "As sessões de psicoterapia têm duração aproximada de 50 minutos, tempo ideal para explorarmos as demandas com profundidade."
            },
            {
              q: "Qual o valor e formas de pagamento?",
              a: "Os valores são informados no momento do agendamento ou via WhatsApp. Aceitamos Pix, Cartão de Crédito e Transferência."
            },
            {
              q: "Atende convênios médicos?",
              a: "Atualmente os atendimentos são particulares, porém emitimos recibo para que você possa solicitar o reembolso junto ao seu convênio."
            },
            {
              q: "Como é feita a terapia online?",
              a: "Utilizamos plataformas seguras e criptografadas (Google Meet). Você só precisa de uma boa conexão e um local privativo."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 hover:border-primary/30 transition-colors">
              <h3 className="font-bold text-lg mb-2">{item.q}</h3>
              <p className="text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="container mx-auto px-6 py-20">
        <div className="bg-sage-50/50 rounded-[3rem] p-8 md:p-16 lg:p-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Entre em contato</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Deseja tirar alguma dúvida pontual antes de agendar? Minha equipe e eu estamos à disposição para te acolher da melhor forma possível.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border w-fit shadow-sm">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">WhatsApp</p>
                    <p className="font-bold text-lg">(11) 99999-9999</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border w-fit shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">E-mail</p>
                    <p className="font-bold text-lg">contato@cliseidepsicologia.com.br</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl" />
              <div className="relative bg-white p-8 rounded-3xl border shadow-sm">
                <form className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Seu Nome</label>
                      <input className="w-full h-12 rounded-xl border-input bg-background/50 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Maria Silva" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">E-mail</label>
                      <input className="w-full h-12 rounded-xl border-input bg-background/50 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="maria@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Assunto</label>
                    <input className="w-full h-12 rounded-xl border-input bg-background/50 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Dúvida sobre valor" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Mensagem</label>
                    <textarea className="w-full min-h-[120px] rounded-xl border-input bg-background/50 p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Como posso te ajudar?" />
                  </div>
                  <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container mx-auto px-6 py-20 pb-0">
        <div className="bg-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl" />

          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Preparado para dar o primeiro passo?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
            A saúde mental é um investimento contínuo. Agende sua primeira sessão e sinta a diferença do acolhimento profissional.
          </p>
          <Link href="/agendar">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-bold shadow-xl">
              Agendar minha consulta agora
            </Button>
          </Link>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="absolute right-full mr-4 bg-white text-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border">
          Como posso te ajudar?
        </span>
        <MessageCircle size={32} />
      </a>
    </div>
  );
}

function UserIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
