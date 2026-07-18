"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { GREETINGS } from "@/src/constants/greetings";
import { useTypingAnimation } from "@/src/hooks/useTypingAnimation";
import GoogleLoginButton from "@/src/components/auth/GoogleLoginButton";
import ConnectWalletButton from "@/src/components/auth/ConnectWalletButton"; // <-- 1. IMPORT BARU
import EmailLoginForm from "@/src/components/auth/EmailLoginForm";

export default function LoginPage() {
    // Hook animasi sekarang cuma 1 baris! 🪄
    const currentText = useTypingAnimation(GREETINGS);

    // State untuk menyimpan token dari Cloudflare Turnstile
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Opsional: State untuk menyimpan data wallet jika butuh di komponen ini
    // const [walletAddress, setWalletAddress] = useState<string | null>(null);

    return (
        <main className="flex h-screen w-full overflow-hidden">

            {/* ========================================== */}
            {/* PANEL KIRI (60%) - Deep Navy Elegance      */}
            {/* ========================================== */}
            <div className="w-3/5 bg-brand-dark flex flex-col justify-end p-12 relative overflow-hidden">

                {/* LAYER 1: BACKGROUND IMAGE */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                    style={{ backgroundImage: "url('/money.webp')" }}
                ></div>

                {/* LAYER 2: DARK OVERLAY */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/80 to-brand-dark/40"></div>

                {/* LAYER 3: AURORA EFFECT */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -bottom-1/2 left-1/4 w-200 h-200 rounded-full bg-linear-to-r from-brand-pink/10 via-brand-light-pink/10 to-transparent blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-125 h-125 rounded-full bg-linear-to-l from-brand-pink/5 to-transparent blur-3xl"></div>
                    <div className="absolute bottom-1/3 left-0 w-100 h-100 rounded-full bg-white/5 blur-2xl"></div>
                </div>

                {/* LAYER 4: TEXT CONTENT */}
                <div className="max-w-2xl relative z-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-tight mb-6">
                        {currentText}
                        <span className="inline-block w-1 h-10 md:h-14 bg-brand-pink ml-2 animate-pulse align-middle"></span>
                    </h1>

                    <p className="text-brand-light-pink text-lg md:text-xl leading-relaxed font-light max-w-lg">
                        The modern way to manage trusted transactions, where{' '}
                        <span className="bg-brand-pink/20 px-2 py-0.5 rounded-md text-white font-medium shadow-sm shadow-brand-pink/10">
                            transparent
                        </span>{' '}
                        transactions happen.
                    </p>
                </div>

                {/* Garis pemisah */}
                <div className="absolute top-0 right-0 h-full w-px bg-white/10"></div>
            </div>

            {/* ========================================== */}
            {/* PANEL KANAN (40%) - Clean Surface Form     */}
            {/* ========================================== */}
            <div className="w-2/5 bg-surface flex items-center justify-center p-12">
                <div className="w-full max-w-sm">

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl text-brand-dark tracking-tight text-left">
                            Sign In
                        </h2>
                        <p className="mt-2 text-sm text-brand-dark/60 text-left">
                            Welcome back. Sign in with your existing account
                        </p>
                    </div>

                    {/* Cloudflare Turnstile - Jalankan secara diam-diam (Invisible) */}
                    <div className="hidden">
                        <Turnstile
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                            onSuccess={(token) => {
                                setTurnstileToken(token);
                                console.log("🛡️ [TURNSTILE SUCCESS] Generate Token:", token);
                            }}
                            onError={() => {
                                console.error("Turnstile verification failed.");
                            }}
                            onExpire={() => {
                                setTurnstileToken(null);
                            }}
                        />
                    </div>

                    {/* 1. Google Login */}
                    <GoogleLoginButton turnstileToken={turnstileToken} />

                    {/* 2. Connect Wallet Button (BARU) */}
                    <div className="mt-3">
                        <ConnectWalletButton 
                            onConnect={(address) => {
                                console.log("✅ Wallet connected:", address);
                                // setWalletAddress(address); // Aktifkan jika perlu disimpan di state halaman ini
                            }}
                            onDisconnect={() => {
                                console.log("❌ Wallet disconnected");
                                // setWalletAddress(null);
                            }}
                        />
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-surface text-brand-dark/40">or continue with email</span>
                        </div>
                    </div>

                    {/* 3. Email Login */}
                    <EmailLoginForm turnstileToken={turnstileToken} />

                    <p className="mt-8 text-center text-xs text-brand-dark/60">
                        By signing in, you agree to our{" "}
                        <a href="#" className="text-brand-dark font-semibold hover:text-brand-pink transition">
                            Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-brand-dark font-semibold hover:text-brand-pink transition">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}