import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://foodies.com.co'),
  title: {
    default: "Foodies | Sabor Auténtico",
    template: "%s | Foodies"
  },
  description: "La mejor comida rápida de Cartagena. Hamburguesas, perros calientes y picadas con el auténtico sabor costeño.",
  openGraph: {
    title: "Foodies | Sabor Auténtico",
    description: "La mejor comida rápida de Cartagena. Pide ahora.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://foodies.com.co',
    siteName: 'Foodies',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foodies | Sabor Auténtico',
    description: 'La mejor comida rápida de Cartagena.',
  }
};

import { Toaster } from 'sonner';
import { GuestLinker } from '@/components/GuestLinker';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <GuestLinker />
        <ToastProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster position="top-right" richColors />
        </ToastProvider>
      </body>
    </html>
  );
}
