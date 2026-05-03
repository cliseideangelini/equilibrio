import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ConditionalShell } from "@/components/ConditionalShell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Equilíbrio | Psicologia Clínica - Cliseide S. Angelini",
  description: "Atendimento psicológico humanizado com base na Terapia Cognitivo-Comportamental. Agende sua consulta com Cliseide S. Angelini.",
  icons: {
    icon: "/icon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={cn(
          inter.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <Navbar />
        <main>{children}</main>
        <ConditionalShell />
        <Toaster position="top-center" richColors />
        <footer className="fixed bottom-4 right-6 pointer-events-none z-[100] hidden md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 opacity-50">
            v1.2.0
          </span>
        </footer>
      </body>
    </html>
  );
}
