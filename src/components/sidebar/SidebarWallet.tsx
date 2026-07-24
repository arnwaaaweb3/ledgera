"use client";

import * as React from "react";
import { Wallet, Check, Copy, ExternalLink } from "lucide-react";

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string | null;
  walletAddress?: string | null;
}

interface SidebarWalletProps {
  onWalletClick?: () => void;
}

// Subscriber event storage lokal agar mendengarkan perubahan data user secara real-time
const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function SidebarWallet({ onWalletClick }: SidebarWalletProps) {
  const [copied, setCopied] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const storedUserRaw = React.useSyncExternalStore(
    subscribeUserStore,
    getUserSnapshot,
    getUserServerSnapshot
  );

  const user = React.useMemo<UserProfile | null>(() => {
    if (!storedUserRaw) return null;
    try {
      return JSON.parse(storedUserRaw);
    } catch {
      return null;
    }
  }, [storedUserRaw]);

  const walletAddress = user?.walletAddress;

  const truncatedAddress = React.useMemo(() => {
    if (!walletAddress) return null;
    if (walletAddress.length <= 10) return walletAddress;
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const handleContainerClick = () => {
    onWalletClick?.();
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
    }
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!walletAddress) return;
    window.open(`https://bscscan.com/address/${walletAddress}`, "_blank");
  };

  return (
    <div className="px-3 py-2" ref={containerRef}>
      <div
        onClick={handleContainerClick}
        className={`bg-white/80 backdrop-blur-sm rounded-xl border border-brand-dark/30 shadow-xs hover:shadow-md transition-all duration-200 ${
          walletAddress ? "hover:border-brand-pink/30 group" : ""
        }`}
        title={walletAddress ? "Click for wallet options" : "Click to connect wallet"}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  walletAddress
                    ? "bg-green-500/10 text-brand-dark"
                    : "bg-brand-pink/10 text-brand-pink"
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-sm font-semibold truncate ${
                      walletAddress
                        ? "font-body text-brand-dark group-hover:text-brand-pink transition-colors"
                        : "text-brand-dark font-heading"
                    }`}
                  >
                    {truncatedAddress || "No Wallet connected"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  {walletAddress ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      <p className="text-xs font-body font-medium text-green-600">
                        Connected
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-body text-brand-dark/50">
                      Not connected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {walletAddress && (
              <div className="flex items-center gap-0.5 shrink-0 pl-2">
                {/* Copy Button */}
                <button
                  onClick={handleCopyClick}
                  className="text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface/50"
                  title="Copy wallet address"
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* External Link Button */}
                <button
                  onClick={handleExternalClick}
                  className="text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface/50"
                  title="View on BscScan"
                  aria-label="View on BscScan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}