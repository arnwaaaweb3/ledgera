// src/components/sidebar/wallets/WalletBalance.tsx
"use client";

import * as React from "react";
import { X, Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUserBalance } from "@/src/hooks/useUserBalance";

interface WalletBalanceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletBalance({ isOpen, onClose }: WalletBalanceProps) {
  const [showBalance, setShowBalance] = React.useState(true);
  
  // 🚀 AMBIL DATA REAL DARI HOOK (Sesuai return type useUserBalance)
  const { balanceRupiah, loading } = useUserBalance();

  // Handle Click Outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".wallet-balance-popup")) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Auto-Scaling Font Size berdasarkan panjang string
  const getFontSizeClass = (text: string) => {
    const len = text.length;
    if (len <= 12) return "text-3xl md:text-4xl"; 
    if (len <= 15) return "text-2xl md:text-3xl"; 
    if (len <= 18) return "text-xl md:text-2xl";   
    return "text-lg md:text-xl";                   
  };

  const currentDisplay = showBalance ? balanceRupiah : "••••••••••••";
  const fontSizeClass = showBalance ? getFontSizeClass(balanceRupiah) : "text-3xl md:text-4xl";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-55 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div
        className={`
          wallet-balance-popup
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          z-60
          w-105 max-w-[92vw] 
          bg-white rounded-2xl shadow-2xl 
          border border-brand-dark/10 
          overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-dark/5">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-dark/80" />
            <h3 className="text-lg font-heading font-semibold text-brand-dark">
              Wallet Balance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close wallet balance"
          >
            <X className="w-5 h-5 text-brand-dark/60 hover:text-brand-dark transition-colors" />
          </button>
        </div>

        {/* Content - Balance Display */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-surface/50 rounded-xl border border-brand-dark/5">
            {/* Label */}
            <p className="text-xs font-body text-brand-dark/50 uppercase tracking-wider mb-2">
              Your Balance
            </p>

            {/* BALANCE DISPLAY */}
            <div className="flex items-center justify-center gap-2 w-full max-w-full">
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-brand-dark/50">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-dark" />
                  <span className="text-sm font-body">Fetching chain balance...</span>
                </div>
              ) : (
                <>
                  <span
                    className={`
                      ${fontSizeClass}
                      font-heading font-bold text-brand-dark
                      tracking-tight whitespace-nowrap
                      transition-all duration-200
                      select-all
                    `}
                  >
                    {currentDisplay}
                  </span>

                  {/* Eye Toggle Button */}
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer text-brand-dark/40 hover:text-brand-dark/70 shrink-0"
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Subtitle kecil */}
            <p className="text-xs font-body text-brand-dark/40 mt-3 text-center">
              Total balance across all networks
            </p>
          </div>
        </div>
      </div>
    </>
  );
}