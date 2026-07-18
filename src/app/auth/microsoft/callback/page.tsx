//src/app/auth/microsoft/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function MicrosoftCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Pastikan window.opener ada (artinya halaman ini dibuka dari popup)
    if (window.opener) {
      if (error) {
        // Kirim pesan error ke jendela utama (LoginPage)
        window.opener.postMessage(
          { type: "MICROSOFT_AUTH_ERROR", error: errorDescription || error }, 
          window.location.origin // Ganti dengan "http://localhost:6969" jika origin bermasalah
        );
      } else if (code && state) {
        // Kirim kode sukses ke jendela utama (LoginPage)
        window.opener.postMessage(
          { type: "MICROSOFT_AUTH_SUCCESS", code, state }, 
          window.location.origin
        );
      }
      
      // Tutup popup segera setelah mengirim pesan
      window.close();
    } else {
      // Fallback jika user membuka URL ini langsung di tab baru (bukan dari popup)
      console.error("Tidak ada window.opener. Login harus dilakukan via popup.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface">
      <svg className="animate-spin h-8 w-8 text-brand-pink mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-brand-dark font-medium">Memproses login Microsoft...</p>
      <p className="text-sm text-brand-dark/50 mt-2">Jendela ini akan menutup otomatis.</p>
    </div>
  );
}