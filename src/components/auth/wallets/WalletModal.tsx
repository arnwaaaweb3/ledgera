// src/components/auth/wallets/WalletModal.tsx

"use client";

import { useEffect } from "react";
import BinanceWallet from "./BinanceWallet";
import MetaMaskWallet from "./MetaMaskWallet";
import TrustWallet from "./TrustWallet";
import WalletConnectWallet from "./WalletConnectWallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, type: string) => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  // Efek untuk close dengan Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handler wrapper untuk kirim type wallet
  const handleBinanceConnect = (address: string) => {
    onConnect(address, "binance");
  };

  const handleMetaMaskConnect = (address: string) => {
    onConnect(address, "metamask");
  };

  const handleTrustConnect = (address: string) => {
    onConnect(address, "trust");
  };

  const handleWalletConnect = (address: string) => {
    onConnect(address, "wallet_connect");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay Blur */}
      <div 
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-brand-dark">
            Connect Wallet
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Wallet Options */}
        <div className="p-6 space-y-3">
          {/* MetaMask Wallet */}
          <MetaMaskWallet onConnect={handleMetaMaskConnect} onClose={onClose} />

          {/* Binance Wallet */}
          <BinanceWallet onConnect={handleBinanceConnect} onClose={onClose} />

          {/* Trust Wallet */}
          <TrustWallet onConnect={handleTrustConnect} onClose={onClose} />

          {/* WalletConnect */}
          <WalletConnectWallet onConnect={handleWalletConnect} onClose={onClose} />
          
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            By connecting a wallet, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}