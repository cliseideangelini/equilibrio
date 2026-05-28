import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ConditionalShell } from "@/components/ConditionalShell";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Equilíbrio | Psicologia Clínica — Cliseide S. Angelini",
  description:
    "Psicologia clínica com base na Terapia Cognitivo-Comportamental (TCC). Atendimento individual, de casal e avaliação psicológica. +9 anos de experiência. Agende sua consulta.",
  keywords: [
    "psicologia",
    "TCC",
    "terapia cognitivo comportamental",
    "Cliseide Angelini",
    "equilíbrio",
    "psicóloga",
    "avaliação psicológica",
    "terapia de casal",
  ],
  openGraph: {
    title: "Equilíbrio | Psicologia Clínica",
    description:
      "Cuidado psicológico humanizado com embasamento científico. Agende sua consulta.",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          jakarta.variable,
          playfair.variable,
          "min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden"
        )}
      >
        <Navbar />
        <main>{children}</main>
        <ConditionalShell />
        <Toaster position="top-center" richColors />

      </body>
    </html>
  );
}
