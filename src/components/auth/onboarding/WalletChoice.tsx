// src/components/auth/onboarding/WalletChoice.tsx
"use client";

import React from "react";
import { Wallet, ShieldCheck, Loader2 } from "lucide-react";

interface WalletChoiceProps {
  loading: boolean;
  onOpenExternalModal: () => void;
  onGenerateAutoWallet: () => void;
}

export default function WalletChoice({
  loading,
  onOpenExternalModal,
  onGenerateAutoWallet,
}: WalletChoiceProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
        <Wallet className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-heading font-bold text-brand-dark tracking-tight">
          Do you have a wallet?
        </h2>
        <p className="mt-1.5 text-sm font-body text-brand-dark/50 max-w-xs mx-auto">
          Connect your existing Web3 wallet, or let Ledgera automatically secure one for you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenExternalModal}
          disabled={loading}
          className="py-3.5 px-4 bg-brand-dark text-white rounded-xl font-heading font-semibold text-sm hover:bg-brand-dark/90 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>Yes, I Have</span>
        </button>

        <button
          type="button"
          onClick={onGenerateAutoWallet}
          disabled={loading}
          className="py-3.5 px-4 bg-surface border-2 border-brand-dark/10 text-brand-dark rounded-xl font-heading font-semibold text-sm hover:border-brand-pink hover:bg-brand-pink/5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
          ) : (
            <span>No, Create One</span>
          )}
        </button>
      </div>
    </div>
  );
}