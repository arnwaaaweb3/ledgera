"use client";

import * as React from "react";
import { Wallet, ChevronRight } from "lucide-react";

export default function SidebarWallet({}) {
  // Sementara ini box kosong dulu
  // Nanti kita isi dengan logic wallet

  return (
    <div className="px-3 py-2">
      {/* Wallet Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-brand-dark/10 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="px-4 py-3">
          {/* Wallet Content - Placeholder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Wallet Icon */}
              <div className="w-8 h-8 rounded-lg bg-brand-pink/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-brand-pink" />
              </div>
              
              {/* Wallet Text */}
              <div>
                <p className="text-sm font-heading font-semibold text-brand-dark">
                  Wallet
                </p>
                <p className="text-xs font-body text-brand-dark/50">
                  Not connected
                </p>
              </div>
            </div>

            {/* Chevron / Action */}
            <ChevronRight className="w-4 h-4 text-brand-dark/40" />
          </div>
        </div>
      </div>
    </div>
  );
}