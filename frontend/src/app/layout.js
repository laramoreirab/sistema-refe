import { Caveat, Nunito } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata = {
  title: "Refê — Restaurante Universitário",
  description: "Totem de validação de senha temporária e créditos do restaurante universitário.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${caveat.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-cream font-sans text-ink antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
