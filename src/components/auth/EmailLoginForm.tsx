"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

// 1. Tambahkan Interface untuk Props agar TypeScript tidak Eror
interface EmailLoginFormProps {
  turnstileToken: string | null;
}

export default function EmailLoginForm({ turnstileToken }: EmailLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasswordField && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPasswordField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showPasswordField) {
      // Langkah 1: Tampilkan field password
      setShowPasswordField(true);
    } else {
      // Validasi Tambahan sebelum request
      if (!turnstileToken) {
        alert("Sistem sedang memverifikasi browser Anda, mohon tunggu sebentar.");
        return;
      }

      // Langkah 2: Kirim ke API
      setLoading(true);
      try {
        const response = await axios.post("/api/auth/email", {
          email,
          password,
          turnstile_token: turnstileToken, // 2. Sertakan token Turnstile ke payload
        }, { timeout: 10000 });

        if (response.data.success) {
          const { token, user } = response.data;
          
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token_expiry", (Date.now() + 3600000).toString());
          
          alert(`Hi! Welcome ${user.email || "User"}!`);
          window.location.replace("/dashboard");
        } else {
          alert(response.data.message || "Authentication failed");
        }
      } catch (error: unknown) {
        let errorMessage = "Login failed. Please try again.";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message || "Network error";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Email Input */}
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          disabled={loading} 
          className="w-full px-3 py-2.5 bg-white border border-brand-dark/10 rounded-lg text-sm text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition duration-200 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Password Input */}
      {showPasswordField && (
        <div className="relative">
          <input
            ref={passwordInputRef}
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={loading} 
            className="w-full px-3 py-2.5 pr-10 bg-white border border-brand-dark/10 rounded-lg text-sm text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition duration-200 disabled:bg-gray-50 disabled:text-gray-500"
          />
          
          {/* Toggle Show/Hide Password */}
          <button
            type="button"
            onClick={() => !loading && setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark transition-colors duration-200 focus:outline-none disabled:opacity-50"
            disabled={loading}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Submit Button dengan Loading State & Turnstile blocker */}
      <button
        type="submit"
        disabled={loading || !turnstileToken} // 3. Kunci tombol jika token Turnstile belum siap
        className="w-full 
        py-2.5 bg-brand-dark 
        text-white text-sm 
        font-semibold cursor-pointer
        rounded-lg hover:bg-brand-dark/90 
        focus:outline-none focus:ring-2 
        focus:ring-brand-dark focus:ring-offset-2 
        focus:ring-offset-surface transition duration-200 
        disabled:opacity-70
        flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{showPasswordField ? "Signing in..." : "Processing..."}</span>
          </>
        ) : (
          <span>{showPasswordField ? "Sign In" : "Continue with Email"}</span>
        )}
      </button>
    </form>
  );
}