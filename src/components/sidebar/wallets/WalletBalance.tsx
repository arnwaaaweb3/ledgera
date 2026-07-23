"use client";

import * as React from "react";
import { X, RefreshCw, Wallet } from "lucide-react";
import { createPublicClient, http, fallback, formatEther } from "viem";
import { bsc, mainnet } from "viem/chains";
import Image from "next/image";

interface WalletBalanceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string | null;
  walletAddress?: string;
}

// Client RPC untuk BNB Smart Chain Mainnet (Multi-fallback anti-timeout)
const bscClient = createPublicClient({
  chain: bsc,
  transport: fallback([
    http("https://rpc.ankr.com/bsc", { timeout: 8_000, retryCount: 2 }),
    http("https://bsc-mainnet.nodereal.io/v1/165d233227f845d892ec949e0d80136e", { timeout: 8_000 }),
    http("https://1rpc.io/bnb", { timeout: 8_000 }),
    http("https://bsc-dataseed.binance.org", { timeout: 8_000 }),
  ]),
});

// Client RPC untuk Ethereum Mainnet (Multi-fallback)
const ethClient = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http("https://rpc.ankr.com/eth", { timeout: 8_000, retryCount: 2 }),
    http("https://1rpc.io/eth", { timeout: 8_000 }),
    http(),
  ]),
});

// Subscriber store untuk membaca localStorage tanpa useEffect
const subscribeUserStore = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getUserSnapshot = () => (typeof window === "undefined" ? null : localStorage.getItem("user"));
const getUserServerSnapshot = () => null;

export default function WalletBalance({ isOpen, onClose }: WalletBalanceProps) {
  const [bnbBalance, setBnbBalance] = React.useState<string>("0");
  const [ethBalance, setEthBalance] = React.useState<string>("0");
  const [loading, setLoading] = React.useState<boolean>(false);

  // Ambil data user secara reaktif dari localStorage
  const storedUserRaw = React.useSyncExternalStore(
    subscribeUserStore,
    getUserSnapshot,
    getUserServerSnapshot
  );

  // Parsing data user & ekstrak wallet address
  const walletAddress = React.useMemo(() => {
    if (!storedUserRaw) return null;
    try {
      const parsedUser: UserProfile = JSON.parse(storedUserRaw);
      return parsedUser.walletAddress || null;
    } catch {
      return null;
    }
  }, [storedUserRaw]);

  // Fetch data saldo dari blockchain (BNB Mainnet & ETH Mainnet)
  const fetchBalances = React.useCallback(async (address: string) => {
    setLoading(true);
    try {
      const [bnbRaw, ethRaw] = await Promise.all([
        bscClient.getBalance({ address: address as `0x${string}` }),
        ethClient.getBalance({ address: address as `0x${string}` }),
      ]);

      setBnbBalance(parseFloat(formatEther(bnbRaw)).toFixed(4));
      setEthBalance(parseFloat(formatEther(ethRaw)).toFixed(4));
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch balance secara asinkron
  React.useEffect(() => {
    if (isOpen && walletAddress) {
      React.startTransition(() => {
        fetchBalances(walletAddress);
      });
    }
  }, [isOpen, walletAddress, fetchBalances]);

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
          <div className="flex items-center gap-1">
            <button
              onClick={() => walletAddress && fetchBalances(walletAddress)}
              disabled={loading || !walletAddress}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer text-brand-dark/60 hover:text-brand-dark disabled:opacity-50"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
              aria-label="Close wallet balance"
            >
              <X className="w-5 h-5 text-brand-dark/60 hover:text-brand-dark transition-colors" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Tokens List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
              Assets Balance
            </span>

            {/* BNB Balance Card */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-brand-dark/10 rounded-xl shadow-xs hover:border-brand-dark/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0">
                  <Image
                    src="/images/bnbchain-logo.png"
                    alt="BNB Chain Logo"
                    width={50}
                    height={50}
                    className="object-cover"
                    priority
                    draggable={false}
                  />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-brand-dark">BNB Chain</h4>
                  <p className="text-xs text-brand-dark/40 font-body">BNB (Mainnet)</p>
                </div>
              </div>
              <div className="text-right">
                {loading ? (
                  <div className="w-16 h-4 bg-brand-dark/10 rounded-md animate-pulse" />
                ) : (
                  <span className="font-mono font-bold text-sm text-brand-dark">
                    {bnbBalance} <span className="text-xs font-normal text-brand-dark/60">BNB</span>
                  </span>
                )}
              </div>
            </div>

            {/* ETH Balance Card */}
            <div className="flex items-center justify-between p-3.5 bg-white border border-brand-dark/10 rounded-xl shadow-xs hover:border-brand-dark/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-blue-500/10 border border-blue-500/20 shrink-0">
                  <Image
                    src="/images/ethereum-logo.png"
                    alt="Ethereum Logo"
                    width={50}
                    height={50}
                    className="object-cover"
                    priority
                    draggable={false}
                  />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-brand-dark">Ethereum</h4>
                  <p className="text-xs text-brand-dark/40 font-body">Ether (Mainnet)</p>
                </div>
              </div>
              <div className="text-right">
                {loading ? (
                  <div className="w-16 h-4 bg-brand-dark/10 rounded-md animate-pulse" />
                ) : (
                  <span className="font-mono font-bold text-sm text-brand-dark">
                    {ethBalance} <span className="text-xs font-normal text-brand-dark/60">ETH</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}