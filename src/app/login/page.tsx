"use client";

import { useState, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// 1. Declare daftar greetings dari berbagai bahasa (diperluas!)
const GREETINGS = [
    // Asia Tenggara
    "Selamat Datang",   // Indonesia / Malaysia
    "Sawasdee",         // Thailand (สวัสดี)
    "Mabuhay",          // Filipina
    "Chào mừng",        // Vietnam
    "Sabaidee",         // Laos (ສະບາຍດີ)
    "Suosdey",          // Kamboja (សួស្តី)
    "Mingalaba",        // Myanmar (မင်္ဂလာပါ)

    // Asia Timur
    "欢迎",              // China (Mandarin)
    "ようこそ",          // Jepang
    "환영합니다",        // Korea

    // Asia Selatan
    "स्वागतम्",         // Hindi (India)
    "වැඩමවීම",         // Sinhala (Sri Lanka)

    // Eropa
    "Welcome",          // English
    "Willkommen",       // Jerman
    "Bienvenue",        // Prancis
    "Benvenuto",        // Italia
    "Bem-vindo",        // Portugis
    "Bienvenido",       // Spanyol
    "Ласкаво просимо", // Ukraina
    "Välkommen",        // Swedia

    // Timur Tengah
    "أهلاً وسهلاً",     // Arab
    "ברוך הבא",         // Ibrani

    // Afrika
    "Karibu",           // Swahili

    // Lainnya
    "Tervetuloa",       // Finlandia
    "Velkommen",        // Denmark/Norwegia
];

export default function LoginPage() {
    // 2. State untuk loading
    const [loading, setLoading] = useState(false);

    // 3. State untuk animasi ketik
    const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPausing, setIsPausing] = useState(false);

    // 4. Logic Animasi Ketik
    useEffect(() => {
        const targetText = GREETINGS[currentGreetingIndex];
        let timer: NodeJS.Timeout;

        if (isPausing) {
            timer = setTimeout(() => {
                setIsPausing(false);
                setIsDeleting(true);
            }, 2000);
            return () => clearTimeout(timer);
        }

        if (!isDeleting && currentText === targetText) {
            timer = setTimeout(() => {
                setIsPausing(true);
            }, 0);
            return () => clearTimeout(timer);
        }

        if (isDeleting && currentText === "") {
            timer = setTimeout(() => {
                setIsDeleting(false);
                setCurrentGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
            }, 0);
            return () => clearTimeout(timer);
        }

        const speed = isDeleting ? 30 : 80;
        timer = setTimeout(() => {
            setCurrentText((prev) =>
                isDeleting
                    ? prev.substring(0, prev.length - 1)
                    : targetText.substring(0, prev.length + 1)
            );
        }, speed);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentGreetingIndex, isPausing]);

    // 5. GOOGLE LOGIN HANDLER
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log("✅ Google login successful!", tokenResponse);
            setLoading(true);

            try {
                // 1. Kirim access_token ke backend
                const response = await axios.post('/api/auth/google', {
                    access_token: tokenResponse.access_token,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000, // 10 detik timeout
                });

                console.log("🔄 Backend response:", response.data);

                // 2. Simpan token dari backend
                if (response.data.success) {
                    const { token, user } = response.data;

                    // ✅ Simpan token dengan expiry
                    localStorage.setItem('auth_token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token_expiry', (Date.now() + 3600000).toString());

                    console.log("👤 User authenticated:", user);

                    // ✅ Pake toast notification lebih keren daripada alert
                    alert(`✅ Welcome ${user.name || 'User'}! Login successful.`);

                    // Redirect ke dashboard
                    window.location.replace('/dashboard');
                } else {
                    const errorMsg = response.data.message || "Authentication failed";
                    alert(`❌ ${errorMsg}`);
                }

            } catch (error: unknown) {
                console.error("❌ Backend error:", error);

                // ✅ Type guard untuk error handling
                let errorMessage = "Login failed. Please try again.";

                if (axios.isAxiosError(error)) {
                    // Handle axios error
                    if (error.code === 'ECONNABORTED') {
                        errorMessage = "Request timeout. Please check your connection.";
                    } else if (error.response) {
                        // Server responded with error status
                        errorMessage = error.response?.data?.error ||
                            error.response?.data?.message ||
                            `Server error (${error.response?.status || ''})`;
                    } else if (error.request) {
                        // Request made but no response
                        errorMessage = "No response from server. Please check your network.";
                    } else {
                        // Something else
                        errorMessage = error.message || "An unexpected error occurred.";
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                alert(`❌ ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error("❌ Google login failed:", error);

            // ✅ Type-safe error handling
            let errorMessage = "Google login failed. Please try again.";

            // Cek properti 'error' dengan type guard
            if (error && typeof error === 'object') {
                // Cek apakah error punya properti 'error' yang tipenya string
                if ('error' in error && typeof error.error === 'string') {
                    const errorCode = error.error;

                    // Handle common error codes
                    if (errorCode.includes('popup_closed')) {
                        errorMessage = "Login popup was closed. Please try again.";
                    } else if (errorCode.includes('access_denied')) {
                        errorMessage = "Access denied. Please allow permissions.";
                    } else if (errorCode.includes('popup_blocked')) {
                        errorMessage = "Popup was blocked. Please allow popups for this site.";
                    } else if (errorCode.includes('invalid_client')) {
                        errorMessage = "Invalid client configuration. Please contact support.";
                    } else {
                        errorMessage = `Google login error: ${errorCode}`;
                    }
                }

                // Cek properti 'error_description' untuk detail tambahan
                if ('error_description' in error && typeof error.error_description === 'string') {
                    console.log("📝 Error detail:", error.error_description);
                }
            }

            alert(`❌ ${errorMessage}`);
            setLoading(false);
        },
        // ✅ Opsi tambahan
        flow: 'implicit',
    });

    // 6. Handler untuk tombol Google
    const handleGoogleLogin = () => {
        login();
    };

    return (
        <main className="flex h-screen w-full overflow-hidden">

            {/* PANEL KIRI (60%) - Deep Navy Elegance */}
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

            {/* PANEL KANAN (40%) - Google OAuth */}
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

                    {/* GOOGLE SIGN IN BUTTON */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 
                                 bg-white border border-gray-300 rounded-lg 
                                 hover:bg-gray-50 hover:shadow-md 
                                 transition-all duration-200
                                 text-brand-dark font-medium 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                {/* Google Icon SVG */}
                                <svg className="w-5 h-5" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                                </svg>
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-surface text-brand-dark/40">or continue with</span>
                        </div>
                    </div>

                    {/* Email option (optional) */}
                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition duration-200"
                            />
                        </div>
                        <button
                            className="w-full py-2.5 bg-brand-dark text-white text-sm font-semibold rounded-lg hover:bg-brand-dark/90 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 focus:ring-offset-surface transition duration-200"
                        >
                            Continue with Email
                        </button>
                    </div>

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