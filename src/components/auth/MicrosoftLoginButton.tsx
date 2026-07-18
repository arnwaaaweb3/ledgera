// src/components/auth/MicrosoftLoginButton.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useMicrosoftLogin } from "@/src/hooks/useMicrosoftLogin";

interface MicrosoftLoginButtonProps {
  turnstileToken: string | null;
  clientId: string;
  redirectUri: string;
}

export default function MicrosoftLoginButton({ 
  turnstileToken, 
  clientId, 
  redirectUri 
}: MicrosoftLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const { login: msLogin, loading: msLoading } = useMicrosoftLogin({
    clientId,
    redirectUri,
    onSuccess: async (tokenResponse) => {
      // Validasi ganda: Pastikan code dan turnstileToken ada sebelum request
      if (!tokenResponse.code) {
        alert("Kode otorisasi dari Microsoft tidak ditemukan. Coba lagi.");
        return;
      }
      if (!turnstileToken) {
        alert("Sistem keamanan sedang memverifikasi koneksi Anda. Mohon coba sesaat lagi.");
        return;
      }

      setLoading(true);
      
      // 🔍 DEBUG: Lihat di Console Browser apa yang mau dikirim
      const payload = {
        code: tokenResponse.code,
        turnstile_token: turnstileToken,
      };
      console.log("🚀 Mengirim payload ke backend:", payload);

      try {
        const response = await axios.post("/api/auth/microsoft", payload, { 
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' } // Paksa header JSON
        });

        if (response.data.success) {
          const { token, user } = response.data;
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token_expiry", (Date.now() + 3600000).toString());
          
          alert(`Hi! Welcome ${user.displayName || "User"}!`);
          window.location.replace("/dashboard");
        } else {
          alert(`${response.data.message || "Authentication failed"}`);
        }
      } catch (error: unknown) {
        let errorMessage = "Login failed. Please try again.";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Network error";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      alert(error.message || "Microsoft login failed.");
    },
  });

  const isDisabled = loading || msLoading || !turnstileToken;

  return (
    <button
      onClick={() => msLogin()}
      disabled={isDisabled}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 
                 bg-white border border-gray-300 rounded-lg 
                 hover:bg-gray-50 hover:shadow-md 
                 transition-all duration-200
                 text-brand-dark font-medium 
                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading || msLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="10" height="10" fill="#f35325" />
            <rect x="12" y="1" width="10" height="10" fill="#81bc06" />
            <rect x="1" y="12" width="10" height="10" fill="#05a6f0" />
            <rect x="12" y="12" width="10" height="10" fill="#ffba08" />
          </svg>
          <span>Sign in with Microsoft</span>
        </>
      )}
    </button>
  );
}