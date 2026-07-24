"use client";

import * as React from "react";
import { X, Wallet } from "lucide-react";

interface WalletBalanceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletBalance({ isOpen, onClose }: WalletBalanceProps) {
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
          w-105 max-w-[90vw] 
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

        {/* Content - KOSONG */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
          </div>
        </div>
      </div>
    </>
  );
}