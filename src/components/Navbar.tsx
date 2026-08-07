"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, User, ShieldCheck, AlignJustify, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/* ── Navigation items ─────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Sobre",        href: "/#sobre" },
  { label: "Serviços",     href: "/#servicos" },
  { label: "Agendamento",  href: "/#agendamento" },
  { label: "Contato",      href: "/#contato" },
];

export function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  /* ── Scroll + auth detection ── */
  useEffect(() => {
    const checkAuth   = () => setIsPatient(document.cookie.includes("patient_id="));
    const handleScroll = () => setScrolled(window.scrollY > 32);

    checkAuth();
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    const interval = setInterval(checkAuth, 3000);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* ── Same-page hash links: Next's <Link> doesn't reliably scroll when only the hash changes ── */
  const handleNavLinkClick = (e: React.MouseEvent, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  /* ── Hidden on internal app pages ── */
  const hiddenRoutes = [
    "/paciente/minha-agenda",
    "/login",
    "/area-clinica",
    "/admin",
  ];
  if (hiddenRoutes.some((r) => pathname.startsWith(r))) return null;

  return (
    <>
      {/* ── Fixed header wrapper ─────────────────────── */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pt-4 pointer-events-none">
        <header
          className={cn(
            "pointer-events-auto w-full transition-all duration-500",
            scrolled
              ? "max-w-5xl nav-pill rounded-2xl px-5 py-3"
              : "max-w-7xl px-2 py-4"
          )}
        >
          <div className="flex items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="Equilíbrio — Página inicial"
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center border text-sm font-serif font-bold transition-all duration-300",
                  "bg-primary/10 border-primary/30 text-primary group-hover:bg-primary group-hover:text-white"
                )}
              >
                Ψ
              </span>
              <span className="font-serif text-lg font-bold tracking-wide text-foreground/90 group-hover:text-primary transition-colors duration-300">
                Equilíbrio
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-7" role="navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={(e) => handleNavLinkClick(e, href)}
                  className="link-underline text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTA group ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Área do Paciente */}
              <Link href={isPatient ? "/paciente/minha-agenda" : "/paciente/login"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl h-9 px-4 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  {isPatient ? "Minha Agenda" : "Área do Paciente"}
                </Button>
              </Link>

              {/* Acesso Profissional */}
              <Link href="/area-clinica">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl h-9 px-4 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Acesso Profissional
                </Button>
              </Link>

              {/* Primary CTA */}
              <Link href="/paciente/login">
                <Button
                  size="sm"
                  className={cn(
                    "gap-2 rounded-xl h-9 px-5 text-[11px] font-bold uppercase tracking-wider",
                    "bg-primary text-white hover:bg-primary/90 hover:shadow-glow",
                    "transition-all duration-300"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Agendar Consulta
                </Button>
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile menu drawer ───────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col pt-24 px-5 pb-8 transition-all duration-400 md:hidden",
          "bg-background/95 backdrop-blur-2xl",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-1 mb-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="py-3.5 px-4 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
              onClick={(e) => { handleNavLinkClick(e, href); setMenuOpen(false); }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <Link href={isPatient ? "/paciente/minha-agenda" : "/paciente/login"} onClick={() => setMenuOpen(false)}>
            <Button variant="outline" className="w-full gap-2 rounded-xl h-12 text-xs font-bold uppercase tracking-wider border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface">
              <User className="w-4 h-4" />
              {isPatient ? "Minha Agenda" : "Área do Paciente"}
            </Button>
          </Link>
          <Link href="/area-clinica" onClick={() => setMenuOpen(false)}>
            <Button variant="outline" className="w-full gap-2 rounded-xl h-12 text-xs font-bold uppercase tracking-wider border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface">
              <ShieldCheck className="w-4 h-4" />
              Acesso Profissional
            </Button>
          </Link>
          <Link href="/paciente/login" onClick={() => setMenuOpen(false)}>
            <Button className="w-full gap-2 rounded-xl h-12 text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/90 hover:shadow-glow transition-all">
              <Calendar className="w-4 h-4" />
              Agendar Consulta
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
