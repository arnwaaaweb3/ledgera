// src/components/auth/NameRegistrationModal.tsx
"use client";

import React, { useState, useSyncExternalStore, useMemo, useEffect } from "react";
import axios from "axios";
import { Sparkles, ArrowRight, User, Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  walletAddress?: string;
}

// Subscriber untuk event 'storage'
const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

// Component Loading Dots
const LoadingDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1">
      <span>Saving Name</span>
      <span className="font-mono w-6 text-left">{dots}</span>
    </span>
  );
};

export default function NameRegistrationModal() {
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [focused, setFocused] = useState(false);

  // Ambil data user dari localStorage
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

  // Modal hanya terbuka jika:
  const isOpen = Boolean(user?.id && !user?.displayName && !isDismissed);

  const handleSubmit = async (e: React.FormEvent) => {
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
        setIsDismissed(true);

        if (window.location.pathname !== "/dashboard") {
          window.location.replace("/dashboard");
        }
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop dengan blur & animasi */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay dengan fade-in */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => !loading && setIsDismissed(true)}
        />

        {/* Modal Card */}
        <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-brand-dark/5 overflow-hidden">

            <div className="p-8 space-y-6">
              {/* Icon & Header */}
              <div className="space-y-3 text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-pink/20 to-brand-light-pink/30 flex items-center justify-center">
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="e.g. John Doe"
                    required
                    autoFocus
                    disabled={loading}
                    className={`
                      w-full px-4 py-3.5 bg-surface/50 rounded-xl 
                      text-sm font-body text-brand-dark placeholder-brand-dark/30
                      border-2 transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-brand-pink/10
                      disabled:bg-surface/30 disabled:cursor-not-allowed
                      ${focused 
                        ? "border-brand-pink shadow-sm" 
                        : "border-transparent hover:border-brand-pink/20"
                      }
                    `}
                  />
                  {displayNameInput && !loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !displayNameInput.trim()}
                  className={`
                    w-full py-3.5 rounded-xl font-heading font-semibold text-sm
                    transition-all duration-200 flex items-center justify-center gap-2.5
                    cursor-pointer relative overflow-hidden group
                    ${loading || !displayNameInput.trim()
                      ? "bg-brand-dark/40 text-white/60 cursor-not-allowed"
                      : "bg-brand-dark text-white hover:bg-brand-dark/90 hover:shadow-lg hover:shadow-brand-dark/20 active:scale-[0.98]"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <LoadingDots />
                    </>
                  ) : (
                    <>
                      <span>Continue to Dashboard</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Skip hint */}
              <div className="text-center">
                <button
                  onClick={() => setIsDismissed(true)}
                  disabled={loading}
                  className="text-xs font-body text-brand-dark/30 hover:text-brand-dark/60 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inject CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
}