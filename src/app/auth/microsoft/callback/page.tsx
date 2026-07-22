"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function MicrosoftCallback() {
  const searchParams = useSearchParams();
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animasi titik-titik
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (window.opener) {
      if (error) {
        window.opener.postMessage(
          { type: "MICROSOFT_AUTH_ERROR", error: errorDescription || error },
          window.location.origin
        );
      } else if (code && state) {
        window.opener.postMessage(
          { type: "MICROSOFT_AUTH_SUCCESS", code, state },
          window.location.origin
        );
      }
      window.close();
    } else {
      console.error("No window.opener available. Login must be initiated via popup.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface">
      <svg className="animate-spin h-8 w-8 text-brand-pink mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-brand-dark font-medium">
        Processing login via Microsoft {dots}
      </p>
      <p className="text-sm text-brand-dark/50 mt-2">This window will automatically close in a few seconds.</p>
    </div>
  );
}