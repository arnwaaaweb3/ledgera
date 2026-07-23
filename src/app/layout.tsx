// src/app/layout.tsx
import type { Metadata } from "next";
import { Ledger, Stack_Sans_Text, Geist } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import NameRegistrationModal from "@/src/components/auth/NameRegistrationModal";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const ledger = Ledger({
  variable: "--font-ledger",
  subsets: ["latin"],
  weight: "400",
  fallback: ["Times New Roman", "Times", "serif"],
});

const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-sans-text",
  subsets: ["latin"],
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
          {/* Modal registrasi nama otomatis (1x muncul saat displayName null) */}
          <NameRegistrationModal />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}