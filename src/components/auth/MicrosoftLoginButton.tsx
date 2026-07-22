"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useMicrosoftLogin } from "@/src/hooks/useMicrosoftLogin";

interface MicrosoftLoginButtonProps {
  clientId: string;
  redirectUri: string;
}

export default function MicrosoftLoginButton({
  clientId,
  redirectUri
}: MicrosoftLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const { login: msLogin, loading: msLoading } = useMicrosoftLogin({
    clientId,
    redirectUri,
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.code) {
        alert("No authorization code from Microsoft were found. Please try again!");
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post("/api/auth/microsoft", {
          code: tokenResponse.code,
        }, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.success) {
          const { token, user } = response.data;
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token_expiry", (Date.now() + 3600000).toString());

          document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

          window.location.replace("/dashboard");
        } else {
          alert(response.data.message || "Authentication failed");
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

  const isDisabled = loading || msLoading;

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
