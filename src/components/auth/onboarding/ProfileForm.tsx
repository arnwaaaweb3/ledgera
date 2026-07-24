// src/components/auth/onboarding/ProfileForm.tsx
"use client";

import React from "react";
import { User, Sparkles, AtSign, Loader2, ArrowRight } from "lucide-react";

interface ProfileFormProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileForm({
  displayName,
  setDisplayName,
  username,
  setUsername,
  loading,
  onSubmit,
}: ProfileFormProps) {
  return (
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
            Setup Your Profile
          </h2>
          <p className="mt-1.5 text-sm font-body text-brand-dark/50 max-w-xs mx-auto">
            Enter your full name and choose a username to make secure payments.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Field 1: Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-heading font-semibold text-brand-dark/70 px-1">
            Full Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. John Doe"
            required
            autoFocus
            disabled={loading}
            className="w-full px-4 py-3 bg-surface/50 rounded-xl text-sm font-body text-brand-dark border-2 border-brand-dark/5 focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all duration-200"
          />
        </div>

        {/* Field 2: Unique Username Tag (@handle) */}
        <div className="space-y-1">
          <label className="text-xs font-heading font-semibold text-brand-dark/70 px-1">
            Username
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-brand-dark/40">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/^@/, "").replace(/\s+/g, "")
                )
              }
              placeholder="johndoeofficial"
              required
              disabled={loading}
              className="w-full pl-9 pr-4 py-3 bg-surface/50 rounded-xl text-sm font-body text-brand-dark border-2 border-brand-dark/5 focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all duration-200"
            />
          </div>
          <p className="text-[11px] font-body text-brand-dark/40 px-1">
            This will be your immutable payment address on Ledgera. You cannot change it later.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !displayName.trim() || !username.trim()}
          className="w-full py-3.5 bg-brand-dark text-white rounded-xl font-heading font-semibold text-sm hover:bg-brand-dark/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-200 mt-2"
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
  );
}