// src/components/auth/NameRegistrationModal.tsx
"use client";

import React, { useState, useSyncExternalStore, useMemo } from "react";
import axios from "axios";
import { Sparkles, ArrowRight, User, Loader2, Wallet, ShieldCheck } from "lucide-react";
import WalletModal from "./wallets/WalletModal";
import { generateAutoWallet } from "@/src/lib/wallet";

interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  walletAddress?: string | null;
}

const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function OnboardingModal() {
  const [completedNameStep, setCompletedNameStep] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const storedUserRaw = useSyncExternalStore(
    subscribeUserStore,
    getUserSnapshot,
    getUserServerSnapshot
  );

  const user = useMemo<UserProfile | null>(() => {
    if (!storedUserRaw) return null;
    try {
      return JSON.parse(storedUserRaw);
    } catch {
      return null;
    }
  }, [storedUserRaw]);

  // DERIVED STATE:
  // Step aktif: Jika user belum punya nama -> NAME, jika sudah -> WALLET_QUESTION
  const step: "NAME" | "WALLET_QUESTION" = (user?.displayName || completedNameStep)
    ? "WALLET_QUESTION"
    : "NAME";

  // FIX: Modal HANYA terbuka jika user BELUM punya displayName ATAU BELUM punya walletAddress
  const needsOnboarding = Boolean(
    user?.id && (!user?.displayName || !user?.walletAddress)
  );
  
  const isOpen = Boolean(needsOnboarding && !isDismissed);

  // Submit Step 1: Simpan Nama
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim() || !user?.id) return;

    setLoading(true);
    try {
      const response = await axios.post("/api/user/profile", {
        userId: user.id,
        displayName: displayNameInput.trim(),
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage"));
        
        setCompletedNameStep(true);
      } else {
        alert(response.data.message || "Failed to save profile name");
      }
    } catch (error) {
      console.error("Error updating profile name:", error);
      alert("Something went wrong while saving your name.");
    } finally {
      setLoading(false);
    }
  };

  // Option "No": Generate Real Automatic Cryptographic Wallet untuk BNB Chain
  const handleGenerateAutoWallet = async () => {
    if (!user?.id) return;

    // Guard Clause: Jangan overwrite jika user sudah punya wallet
    if (user.walletAddress) {
      setIsDismissed(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Generate EVM Wallet Keypair Asli via viem
      const newWallet = generateAutoWallet();

      // 2. Simpan alamat wallet asli (0x...) ke Database
      const response = await axios.post("/api/user/wallet", {
        userId: user.id,
        walletAddress: newWallet.address,
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Simpan private key di session (jika butuh auto-sign transaction)
        sessionStorage.setItem("user_pk", newWallet.privateKey);

        window.dispatchEvent(new Event("storage"));
        setIsDismissed(true);

        if (window.location.pathname !== "/dashboard") {
          window.location.replace("/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to generate real EVM wallet:", error);
      alert("Failed to setup cryptographic wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Option "Yes": Membuka Modal Wallet External
  const handleConnectExternalWallet = (address: string) => {
    if (!user?.id) return;

    axios
      .post("/api/user/wallet", {
        userId: user.id,
        walletAddress: address,
      })
      .then((res) => {
        if (res.data.success) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.dispatchEvent(new Event("storage"));
          setIsWalletModalOpen(false);
          setIsDismissed(true);

          if (window.location.pathname !== "/dashboard") {
            window.location.replace("/dashboard");
          }
        }
      })
      .catch((err) => console.error("Wallet save error", err));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
          onClick={() => !loading && setIsDismissed(true)}
        />

        <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-brand-dark/5 overflow-hidden p-8 space-y-6">
            
            {/* STEP 1: INPUT NAMA */}
            {step === "NAME" && (
              <>
                <div className="space-y-3 text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-brand-pink/20 to-brand-light-pink/30 flex items-center justify-center">
                      <User className="w-8 h-8 text-brand-pink" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-pink flex items-center justify-center shadow-lg shadow-brand-pink/30">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-brand-dark tracking-tight">
                      What&apos;s your name?
                    </h2>
                    <p className="mt-1.5 text-sm font-body text-brand-dark/50 max-w-xs mx-auto">
                      Enter your full name or nickname to personalize your experience
                    </p>
                  </div>
                </div>

                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    autoFocus
                    disabled={loading}
                    className="w-full px-4 py-3.5 bg-surface/50 rounded-xl text-sm font-body text-brand-dark border-2 focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all duration-200"
                  />

                  <button
                    type="submit"
                    disabled={loading || !displayNameInput.trim()}
                    className="w-full py-3.5 bg-brand-dark text-white rounded-xl font-heading font-semibold text-sm hover:bg-brand-dark/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: DO YOU HAVE A WALLET? */}
            {step === "WALLET_QUESTION" && (
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
                    onClick={() => setIsWalletModalOpen(true)}
                    disabled={loading}
                    className="py-3.5 px-4 bg-brand-dark text-white rounded-xl font-heading font-semibold text-sm hover:bg-brand-dark/90 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <span>Yes, I Have</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAutoWallet}
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
            )}

          </div>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={(address) => handleConnectExternalWallet(address)}
      />
    </>
  );
}