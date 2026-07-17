"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await axios.post("/api/auth/google", {
          access_token: tokenResponse.access_token,
        }, { timeout: 10000 });

        if (response.data.success) {
          const { token, user } = response.data;
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token_expiry", (Date.now() + 3600000).toString());
          
          // Nanti ganti dengan toast notification (misal: sonner atau react-hot-toast)
          alert(`Hi! Welcome ${user.name || "User"}!`);
          window.location.replace("/dashboard");
        } else {
          alert(`${response.data.message || "Authentication failed"}`);
        }
      } catch (error: unknown) {
        let errorMessage = "Login failed. Please try again.";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message || "Network error";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        alert(`${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      let errorMessage = "Google login failed.";
      if (error && typeof error === "object" && "error" in error) {
        const errorCode = String(error.error);
        if (errorCode.includes("popup_closed")) errorMessage = "Login popup was closed.";
        else if (errorCode.includes("access_denied")) errorMessage = "Access denied.";
      }
      alert(`${errorMessage}`);
    },
    flow: "implicit",
  });

  return (
    <button
      onClick={() => login()}
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
  );
}