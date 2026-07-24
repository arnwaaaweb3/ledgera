// src/hooks/useUserBalance.ts
"use client";

import { useState, useEffect } from "react";
import { idrAdapterRegistry } from "@/src/lib/adapters";

// Helper function untuk membaca walletAddress secara aman (SSR safe)
function getInitialWalletAddress(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return parsed?.walletAddress || null;
  } catch (e) {
    console.error("Error parsing stored user:", e);
    return null;
  }
}

export function useUserBalance() {
  // 1. Lazy state initialization (Mengisi state awal tanpa useEffect)
  const [walletAddress] = useState<string | null>(getInitialWalletAddress);
  const [balance, setBalance] = useState<number>(0);
  
  // Jika walletAddress null dari awal, isLoading langsung false
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getInitialWalletAddress()));

  useEffect(() => {
    // Jika tidak ada wallet, hentikan effect
    if (!walletAddress) return;

    let isMounted = true;

    async function fetchBalances() {
      try {
        const cumulative = await idrAdapterRegistry.getCumulativeBalanceInRupiah(walletAddress!);
        if (isMounted) {
          setBalance(cumulative);
        }
      } catch (err) {
        console.error("Failed to fetch cumulative balance:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBalances();

    // Polling setiap 15 detik untuk update balance dari chain
    const interval = setInterval(fetchBalances, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [walletAddress]);

  return { balance, isLoading, walletAddress };
}