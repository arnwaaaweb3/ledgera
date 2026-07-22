import type { Metadata } from "next";
import { Ledger, Stack_Sans_Text, Geist } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const ledger = Ledger({
  variable: "--font-ledger",
  subsets: ["latin"],
  weight: "400",
  // Menambahkan fallback untuk font judul/logo agar tetap formal tepercaya
  fallback: ["Times New Roman", "Times", "serif"],
});

const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-sans-text",
  subsets: ["latin"],
  // SOLUSI: Secara manual mendefinisikan fallback font komparatif terpercaya ala fintech P2P profesional
  fallback: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Ledgera",
  description: "P2P Transaction Platform based on Blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", ledger.variable, stackSansText.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-surface text-brand-dark">
        {/* WRAP dengan GoogleOAuthProvider */}
        <GoogleOAuthProvider 
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}