import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ConditionalShell } from "@/components/ConditionalShell";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

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
    <html lang="pt-BR" className="scroll-smooth dark">
      <body
        className={cn(
          jakarta.variable,
          playfair.variable,
          "min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/30"
        )}
      >
        <Navbar />
        <main>{children}</main>
        <ConditionalShell />
        <Toaster position="top-center" richColors />
        <footer className="fixed bottom-4 right-6 pointer-events-none z-[100] hidden md:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-800 opacity-100 bg-stone-100 px-2 py-1 rounded-md shadow-sm border border-stone-200">
            v1.4.1
          </span>
        </footer>
      </body>
    </html>
  );
}
