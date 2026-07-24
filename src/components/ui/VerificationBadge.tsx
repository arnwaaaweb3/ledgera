// src/components/ui/VerificationBadge.tsx
"use client";

import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface VerificationBadgeProps {
  authProvider?: string | null;
  isVerified?: boolean;
  showDetail?: boolean;
}

export default function VerificationBadge({
  authProvider = "EMAIL",
  isVerified = false,
  showDetail = false,
}: VerificationBadgeProps) {
  const providerUpper = (authProvider || "EMAIL").toUpperCase();

  // 1. KONDISI VERIFIED -> SHIELD HIJAU
  if (isVerified) {
    return (
      <div 
        className="inline-flex items-center gap-1.5" 
        title={`Verified Account via ${providerUpper}`}
      >
        <span className="inline-flex items-center justify-center text-emerald-500">
          <ShieldCheck className="w-4 h-4 fill-emerald-100 text-emerald-600" />
        </span>

        {showDetail && (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            {providerUpper === "GOOGLE" 
              ? "Google Verified" 
              : providerUpper === "MICROSOFT" 
              ? "Microsoft Verified" 
              : "Verified"}
          </span>
        )}
      </div>
    );
  }

  // 2. KONDISI UNVERIFIED -> SHIELD ABU-ABU
  return (
    <div 
      className="inline-flex items-center gap-1.5" 
      title="Unverified Account"
    >
      <span className="inline-flex items-center justify-center text-gray-400">
        <ShieldAlert className="w-4 h-4 fill-gray-100 text-gray-400" />
      </span>

      {showDetail && (
        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
          Unverified Email
        </span>
      )}
    </div>
  );
}