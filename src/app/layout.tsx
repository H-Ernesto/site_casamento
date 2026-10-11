import type { Metadata } from "next";
import { Great_Vibes, Cinzel, Inter } from "next/font/google";
import "./globals.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-script" });
const caps = Cinzel({ subsets: ["latin"], variable: "--font-caps" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gustavo-e-debora.vercel.app"),
  title: "Gustavo & Débora – Casamento",
  description: "Site oficial do casamento de Gustavo e Débora – 3 de julho de 2027, às 16h30.",
  openGraph: {
    title: "Gustavo & Débora – Casamento",
    description: "Confira detalhes e confirme sua presença.",
    images: [{ url: "/images/hero.jpg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${script.variable} ${caps.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
