import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { ConditionalShell } from "@/components/ConditionalShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Equilíbrio | Psicologia Clínica - Cliseide S. Angelini",
  description: "Atendimento psicológico humanizado com base na Terapia Cognitivo-Comportamental. Agende sua consulta com Cliseide S. Angelini.",
  icons: {
    icon: "/favicon.png",
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
          "min-height-screen bg-background font-sans antialiased"
        )}
      >
        <Navbar />
        <main>{children}</main>
        <ConditionalShell />
      </body>
    </html>
  );
}
