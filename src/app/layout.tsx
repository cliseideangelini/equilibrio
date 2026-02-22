import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

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
        <footer className="bg-sage-50 border-t py-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Equilíbrio Psicologia Clínica - Cliseide S. Angelini (CRP 123230)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Desenvolvido com carinho para o bem-estar. (By Pedro Gabriel)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
