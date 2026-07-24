// src/components/auth/NameRegistrationModal.tsx
"use client";

import React, { useState, useSyncExternalStore, useMemo } from "react";
import { usePathname } from "next/navigation";
import axios, { AxiosError } from "axios";
import WalletModal from "./wallets/WalletModal";
import ProfileForm from "./onboarding/ProfileForm";
import WalletChoice from "./onboarding/WalletChoice";
import { generateAutoWallet } from "@/src/lib/wallet";

interface UserProfile {
  id: string;
  email?: string;
  displayName?: string | null;
  username?: string | null;
  walletAddress?: string | null;
}

interface ErrorResponse {
  message?: string;
}

const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function OnboardingModal() {
  const pathname = usePathname();
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
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

  // Syarat Onboarding Modal
  const needsDisplayName = Boolean(user && (!user.displayName || !user.username));
  const needsWallet = Boolean(user && !user.walletAddress);

  // 🚨 GUARD PATH: Jangan pernah buka modal jika berada di halaman login atau homepage publik
  const isPublicPage = pathname === "/login" || pathname === "/";
  const isOpen = Boolean((needsDisplayName || needsWallet) && !isDismissed && !isPublicPage);

  // Submit profile name & username
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayNameInput.trim() || !usernameInput.trim()) return;

    const formattedUsername = usernameInput.trim().replace(/^@/, "").replace(/\s+/g, "").toLowerCase();

    setLoading(true);
    try {
      const userId = user?.id || `user_${Date.now()}`;
      const currentWallet = user?.walletAddress || localStorage.getItem("wallet_address");

      const response = await axios.post("/api/user/profile", {
        userId,
        displayName: displayNameInput.trim(),
        username: formattedUsername,
        walletAddress: currentWallet,
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            id: userId,
            displayName: displayNameInput.trim(),
            username: formattedUsername,
            walletAddress: currentWallet,
          })
        );
      }

      window.dispatchEvent(new Event("storage"));

      if (currentWallet) {
        setIsDismissed(true);
        if (window.location.pathname !== "/dashboard") {
          window.location.replace("/dashboard");
        }
      }
    } catch (error: unknown) {
      console.error("Error updating profile name:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMsg =
        axiosError?.response?.data?.message || "Failed to save profile. Username might be taken.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Generate Auto Wallet
  const handleGenerateAutoWallet = async () => {
    if (!user?.id) return;
    if (user.walletAddress) {
      setIsDismissed(true);
      return;
    }

    setLoading(true);
    try {
      const newWallet = generateAutoWallet();
      const response = await axios.post("/api/user/wallet", {
        userId: user.id,
        walletAddress: newWallet.address,
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.dispatchEvent(new Event("storage"));
        setIsDismissed(true);

        if (window.location.pathname !== "/dashboard") {
          window.location.replace("/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to generate wallet:", error);
      alert("Failed to setup wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Connect External Wallet
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
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" />

        <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-brand-dark/5 overflow-hidden p-8 space-y-6">
            
            {needsDisplayName ? (
              <ProfileForm
                displayName={displayNameInput}
                setDisplayName={setDisplayNameInput}
                username={usernameInput}
                setUsername={setUsernameInput}
                loading={loading}
                onSubmit={handleNameSubmit}
              />
            ) : needsWallet ? (
              <WalletChoice
                loading={loading}
                onOpenExternalModal={() => setIsWalletModalOpen(true)}
                onGenerateAutoWallet={handleGenerateAutoWallet}
              />
            ) : null}

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