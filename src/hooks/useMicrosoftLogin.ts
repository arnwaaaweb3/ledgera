// src/hooks/useMicrosoftLogin.ts
import { useState, useCallback } from "react";

interface MicrosoftLoginOptions {
  clientId: string;
  redirectUri: string;
  onSuccess: (response: { code: string }) => void;
  onError: (error: Error) => void;
}

export function useMicrosoftLogin({ clientId, redirectUri, onSuccess, onError }: MicrosoftLoginOptions) {
  const [loading, setLoading] = useState(false);

  const login = useCallback(() => {
    setLoading(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Generate state acak untuk mencegah CSRF
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("microsoft_oauth_state", state);

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email%20User.Read&response_mode=query&state=${state}`;

    const popup = window.open(authUrl, "Microsoft Login", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);

    if (!popup) {
      onError(new Error("Your browser does not allow any pop-ups. Please allow pop-ups for this site."));
      setLoading(false);
      return;
    }

    // ✅ PERBAIKAN 1: Deklarasikan variabel flag di sini
    let hasReceivedMessage = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "MICROSOFT_AUTH_SUCCESS") {
        if (event.data.state === sessionStorage.getItem("microsoft_oauth_state")) {
          // ✅ PERBAIKAN 2: Tandai bahwa kita sudah menerima pesan sukses
          hasReceivedMessage = true;
          
          onSuccess({ code: event.data.code });
          sessionStorage.removeItem("microsoft_oauth_state");
        } else {
          onError(new Error("State mismatch. Possible CSRF attack."));
        }
        window.removeEventListener("message", handleMessage);
        setLoading(false);
        
      } else if (event.data.type === "MICROSOFT_AUTH_ERROR") {
        // ✅ PERBAIKAN 3: Tandai juga jika ada error, agar tidak trigger error "ditutup manual"
        hasReceivedMessage = true;
        
        onError(new Error(event.data.error || "Login gagal"));
        window.removeEventListener("message", handleMessage);
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // Polling untuk mendeteksi jika user menutup popup secara manual
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          setLoading(false);
          
          // Hanya tampilkan error jika belum ada data yang masuk (baik sukses maupun error)
          if (!hasReceivedMessage) { 
            onError(new Error("Pop-up has been closed manually by the user."));
          }
        }
      } catch { 
        // Abaikan error COOP, biarkan interval berhenti dengan aman
        clearInterval(checkClosed);
      }
    }, 1000); 

  }, [clientId, redirectUri, onSuccess, onError]);

  return { login, loading };
}