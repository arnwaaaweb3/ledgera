// src/hooks/useUserBalance.ts
"use client";

import { useState, useEffect } from "react";
import { idrAdapterRegistry } from "@/src/lib/adapters";

export function useUserBalance() {
  const [balanceRupiah, setBalanceRupiah] = useState<string>("Rp 0");
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        // 1. Ambil data user dari LocalStorage
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        const walletAddress = userData?.walletAddress;

        if (!walletAddress) {
          setLoading(false);
          return;
        }

        // 2. Minta saldo dari IDRX Adapter
        const idrxAdapter = idrAdapterRegistry.getAdapter("IDRX");
        if (idrxAdapter) {
          const balance = await idrxAdapter.getBalance(walletAddress);
          setRawBalance(balance);
          setBalanceRupiah(idrxAdapter.formatToRupiah(balance));
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();

    // Polling setiap 10 detik
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  return { balanceRupiah, rawBalance, loading };
}