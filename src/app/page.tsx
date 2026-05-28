"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Heart,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Linkedin,
  Star,
  CheckCircle,
  Sparkles,
  Calendar,
  Users,
  Award,
  MessageCircle,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   DATA — Conteúdo da clínica
───────────────────────────────────────────────────────────── */
const SERVICES = [
  {
    icon: Brain,
    title: "Terapia Individual",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    hoverBorder: "hover:border-primary/50",
    description:
      "Atendimento personalizado para crianças, adolescentes, adultos e idosos. Desenvolvemos juntos ferramentas práticas para superar desafios emocionais e comportamentais.",
    items: ["Ansiedade e depressão", "Estresse e burnout", "Autoconhecimento", "Qualidade de vida"],
  },
  {
    icon: Heart,
    title: "Terapia de Casal",
    color: "text-warm",
    bg: "bg-warm/10",
    border: "border-warm/20",
    hoverBorder: "hover:border-warm/50",
    description:
      "Mediação profissional para casais que buscam fortalecer vínculos, resolver conflitos e construir relacionamentos mais saudáveis e comunicativos.",
    items: ["Comunicação não-violenta", "Resolução de conflitos", "Intimidade emocional", "Reconstrução de vínculos"],
  },
  {
    icon: ShieldCheck,
    title: "Avaliação Psicológica",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    hoverBorder: "hover:border-blue-400/50",
    description:
      "Foco estratégico corporativo (B2B), trânsito e transportadoras, além de diagnósticos clínicos com instrumentos psicométricos validados.",
    items: ["Empresas e corporativo", "Trânsito e transportadoras", "Psicossocial", "Laudos e relatórios"],
  },
];

const CREDENTIALS = [
  "Bacharel em Psicologia",
  "Especialização em TCC",
  "Pós-graduação em Psicopedagogia",
  "Formação em Terapia de Casal",
];


const CONTACT_INFO = [
  { icon: Phone,  label: "WhatsApp",    value: "(19) 98827-5290",              href: "https://wa.me/5519988275290" },
  { icon: MapPin, label: "Localização", value: "Limeira — SP (Presencial)",   href: "#" },
  { icon: Clock,  label: "Horários",    value: "Seg–Sex: 8h às 20h",           href: "#" },
];

/* ─────────────────────────────────────────────────────────────
   INTERSECTION OBSERVER HOOK — fade-up on scroll
───────────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────────
   SECTION LABEL — reutilizável
───────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge mb-5 inline-flex">
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function HomePage() {
  useReveal();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 overflow-hidden"
        aria-label="Hero — Apresentação da clínica"
      >
        {/* Orbs de fundo */}
        <div aria-hidden className="orb w-[600px] h-[600px] bg-primary/12 -top-40 -left-40 animate-orb" />
        <div aria-hidden className="orb w-[500px] h-[500px] bg-warm/8   bottom-0 right-0  animate-orb-slow" />
        <div aria-hidden className="orb w-[300px] h-[300px] bg-blue-400/6 top-1/2 left-1/2 animate-orb" />

        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left column: Copy ── */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              {/* Badge */}
              <div className="animate-fade-up">
                <SectionLabel>Psicologia Clínica · TCC · CRP 06/XXXXX</SectionLabel>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up delay-100 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold text-foreground">
                Encontre <br className="hidden sm:block" />
                o seu{" "}
                <em className="not-italic text-gradient">Equilíbrio.</em>
              </h1>

              {/* Sub */}
              <p className="animate-fade-up delay-200 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                <strong className="text-foreground/90 font-semibold">12 anos</strong> de experiência
                clínica com base na{" "}
                <strong className="text-foreground/90 font-semibold">
                  Terapia Cognitivo-Comportamental (TCC)
                </strong>
                . Um espaço seguro e acolhedor para você redescobrir suas forças e viver com mais qualidade.
              </p>

              {/* CTA buttons */}
              <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/#agendamento">
                  <Button
                    size="lg"
                    className="gap-2.5 h-13 px-7 text-sm font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 hover:shadow-glow rounded-xl transition-all duration-300 w-full sm:w-auto group"
                  >
                    <Calendar className="w-4 h-4" />
                    Agendar Consulta
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/#sobre">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 px-7 text-sm font-semibold border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface hover:border-primary/40 rounded-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Conheça a Cliseide
                  </Button>
                </Link>
              </div>

              {/* Social proof mini */}
              <div className="animate-fade-up delay-400 flex items-center gap-3 pt-1">
                <div className="flex -space-x-2">
                  {["A", "B", "C"].map((l) => (
                    <div
                      key={l}
                      className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-warm text-warm" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    Avaliação 5 estrelas pelos pacientes
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right column: Clinic photo ── */}
            <div className="order-1 lg:order-2 animate-fade-up delay-200">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-h-[560px] group shadow-dim-lg">
                {/* Photo */}
                <Image
                  src="/cliseide.png"
                  alt="Cliseide S. Angelini — Psicóloga Clínica, especialista em TCC"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Gradient overlay bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                {/* Caption pill */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="font-serif text-sm font-bold text-primary">Ψ</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">Cliseide S. Angelini</p>
                      <p className="text-xs text-muted-foreground">Psicóloga Clínica · 12 anos de experiência</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════════
          SOBRE A PROFISSIONAL
      ══════════════════════════════════════════════ */}
      <section
        id="sobre"
        className="py-16 sm:py-24 px-4 sm:px-6"
        aria-label="Sobre Cliseide S. Angelini"
      >
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="max-w-xl mb-16 reveal">
            <SectionLabel>Sobre a Profissional</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
              Cliseide S. Angelini
            </h2>
            <div className="section-divider" />
            <p className="text-muted-foreground text-base leading-relaxed">
              Psicóloga clínica com sólida formação acadêmica e 12 anos dedicados
              ao cuidado da saúde mental.
            </p>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Bio card — wide */}
            <div className="lg:col-span-3 reveal">
              <div className="glass-card rounded-3xl p-8 sm:p-10 h-full flex flex-col gap-6">
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  A terapia é um processo colaborativo, onde trabalhamos juntos para{" "}
                  <strong className="text-foreground/90 font-semibold">
                    compreender e reestruturar seus padrões de pensamento e comportamento
                  </strong>
                  . Por meio de técnicas da Terapia Cognitivo-Comportamental (TCC), ofereço
                  ferramentas práticas, seguras e com{" "}
                  <strong className="text-foreground/90 font-semibold">
                    embasamento científico comprovado
                  </strong>
                  , além de acolhimento humano genuíno e respeito à subjetividade de cada paciente.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Tenho atuado na área clínica desde 2014, atendendo crianças, adolescentes,
                  adultos, idosos, terapia de casal e realizando avaliações psicológicas.
                  Venha conhecer o meu trabalho e{" "}
                  <strong className="text-foreground/90 font-semibold">
                    desenvolver o melhor de você.
                  </strong>
                </p>

                {/* Formation pills */}
                <div className="mt-auto pt-4 border-t border-border/50">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    Formações e Qualificações
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {CREDENTIALS.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 text-sm text-foreground/80 font-medium">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Side cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Abordagem */}
              <div className="reveal glass-card rounded-3xl p-8 flex flex-col gap-4 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Abordagem TCC</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A Terapia Cognitivo-Comportamental é uma das abordagens psicológicas com maior evidência
                  científica, eficaz para ansiedade, depressão, TOC, fobias e muito mais.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Científico", "Estruturado", "Focado em resultados"].map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modalidades */}
              <div className="reveal glass-card rounded-3xl p-8 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-2xl bg-warm/10 border border-warm/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-warm" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">Modalidades</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Presencial", "Online (Video)", "Crianças", "Adolescentes", "Adultos", "Idosos"].map((m) => (
                    <div
                      key={m}
                      className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SERVIÇOS / ESPECIALIDADES
      ══════════════════════════════════════════════ */}
      <section
        id="servicos"
        className="py-24 sm:py-32 px-4 sm:px-6 bg-surface/20"
        aria-label="Especialidades e serviços"
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="max-w-2xl mb-16 reveal">
            <SectionLabel>Especialidades</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
              Como posso ajudar você?
            </h2>
            <div className="section-divider" />
            <p className="text-muted-foreground text-base leading-relaxed">
              Cada atendimento é único, respeitando a sua história e individualidade.
              Conheça as áreas de atuação da clínica Equilíbrio.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, color, bg, border, hoverBorder, description, items }, idx) => (
              <article
                key={title}
                className={cn(
                  "reveal glass-card rounded-3xl p-8 flex flex-col gap-6 border",
                  border,
                  hoverBorder
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Icon */}
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", bg, border)}>
                  <Icon className={cn("w-6 h-6", color)} />
                </div>

                {/* Title & description */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                {/* Feature list */}
                <ul className="flex flex-col gap-2 mt-auto">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <CheckCircle className={cn("w-3.5 h-3.5 shrink-0", color)} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/#agendamento">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-center gap-1.5 rounded-xl h-10 text-xs font-bold uppercase tracking-wider border transition-all",
                      border,
                      hoverBorder,
                      color,
                      "hover:bg-primary/5"
                    )}
                  >
                    Agendar sessão
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ / DÚVIDAS FREQUENTES
      ══════════════════════════════════════════════ */}
      <section
        id="faq"
        className="py-24 sm:py-32 px-4 sm:px-6"
        aria-label="Dúvidas Frequentes"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 reveal">
            <SectionLabel>Dúvidas Frequentes</SectionLabel>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5">
              Perguntas comuns
            </h2>
            <div className="section-divider mx-auto" />
          </div>

          <div className="flex flex-col gap-4 reveal">
            {[
              {
                q: "Qual o tempo de duração da sessão?",
                a: "As sessões têm duração média de 30 a 50 minutos, tempo ideal para desenvolvermos o trabalho terapêutico de forma focada e produtiva."
              },
              {
                q: "Como funciona o cancelamento ou falta?",
                a: "A sessão desmarcada sem antecedência ou em caso de falta será cobrada integralmente, pois o horário fica reservado exclusivamente para você."
              },
              {
                q: "Qual o valor da consulta e formas de pagamento?",
                a: "Os valores podem ser consultados diretamente via WhatsApp ou no momento da consulta. Aceitamos Dinheiro, Pix, Cartão de Crédito e Débito."
              },
              {
                q: "Atende por convênio médico?",
                a: "Somos credenciados aos convênios Doctor Prime e Saúde Bradesco. Nos atendimentos particulares, oferecemos descontos especiais para conveniados Unimed, Hapvida e Frei Galvão, assim como nos pacotes de 4 sessões."
              },
            ].map((faq, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 border border-border/40 hover:border-primary/30 transition-colors duration-300">
                <h3 className="font-serif text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-3.5 border-l border-border/40">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AGENDAMENTO / CONTATO
      ══════════════════════════════════════════════ */}
      <section
        id="agendamento"
        className="py-24 sm:py-32 px-4 sm:px-6"
        aria-label="Agendamento e contato"
      >
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="max-w-xl mb-16 reveal">
            <SectionLabel>Agendamento</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
              Dê o primeiro passo.
            </h2>
            <div className="section-divider" />
            <p className="text-muted-foreground text-base leading-relaxed">
              Entre em contato agora mesmo. Respondemos rapidamente e montamos juntos
              o plano de atendimento ideal para você.
            </p>
          </div>

          {/* WhatsApp-first contact block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="contato">

            {/* Patient Portal CTA */}
            <div className="reveal lg:col-span-2">
              <div className="relative glass-card rounded-3xl p-10 sm:p-14 overflow-hidden border border-primary/20 hover:border-primary/50 transition-colors duration-500 group h-full flex flex-col justify-center">
                {/* Ambient glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

                <div className="relative z-10 flex flex-col gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Acesse o Portal do Paciente<br />para agendar sua consulta.
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                      O agendamento é feito de forma 100% online, rápida e segura.
                      Entre na sua conta ou cadastre-se para escolher o melhor dia e horário
                      para o seu atendimento.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Link href="/paciente/login" className="flex-1 sm:flex-none">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto gap-3 h-14 px-8 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 hover:shadow-dim-lg hover:-translate-y-0.5 group/btn"
                      >
                        <User className="w-4 h-4" />
                        Fazer Login
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/paciente/cadastro" className="flex-1 sm:flex-none">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto gap-2 h-14 px-8 text-sm font-semibold border-border/70 text-foreground hover:bg-surface hover:border-primary/40 rounded-xl transition-all duration-300"
                      >
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info sidebar */}
            <div className="flex flex-col gap-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="reveal glass-card rounded-2xl p-5 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                    <Icon className="w-4 h-4 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-foreground/90">{value}</p>
                  </div>
                </a>
              ))}

              {/* Trust badge */}
              <div className="reveal glass-card rounded-2xl p-5 border border-primary/15 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warm text-warm" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground/80 leading-snug">
                  "Atendimento cuidadoso e resultados reais."
                </p>
                <p className="text-xs text-muted-foreground mt-1">— Paciente, 2024</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="border-t border-border/40 bg-surface/30" aria-label="Rodapé">

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center border bg-primary/10 border-primary/30 text-sm font-serif font-bold text-primary">
                Ψ
              </span>
              <span className="font-serif text-lg font-bold text-foreground/80">Equilíbrio</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Psicologia Clínica com embasamento científico e cuidado humano. Atendimento
              presencial e online.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface hover:border-primary/40 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface hover:border-primary/40 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5519988275290"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links — Clínica */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Clínica
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Sobre a Cliseide", href: "/#sobre" },
                { label: "Especialidades",   href: "/#servicos" },
                { label: "Agendamento",      href: "/#agendamento" },
                { label: "Contato",          href: "/#contato" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground link-underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — Sistema */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Sistema
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Área do Paciente",     href: "/paciente/login" },
                { label: "Minha Agenda",          href: "/paciente/minha-agenda" },
                { label: "Agendar Consulta",      href: "/agendar" },
                { label: "Acesso Profissional",   href: "/admin" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground link-underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Informações
            </p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                Limeira — SP
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                (19) 98827-5290
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                Seg–Sex: 8h às 20h
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                CRP 06/XXXXX
              </li>
            </ul>
          </div>

        </div>


      </footer>

    </div>
  );
}
