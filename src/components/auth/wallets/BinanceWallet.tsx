// src/components/auth/wallets/BinanceWallet.tsx
"use client";

import Image from "next/image";
import { useBinanceWallet } from "@/src/hooks/useBinanceWallet";
import WalletOption from "./WalletOption";

interface BinanceWalletProps {
  onConnect: (address: string) => void;
  onClose?: () => void;
}

export default function BinanceWallet({ onConnect, onClose }: BinanceWalletProps) {
  const { connect, loading, isInstalled, error } = useBinanceWallet();

  const handleConnect = async () => {
    try {
      const address = await connect();
      onConnect(address);
      onClose?.();
    } catch (err) {
      console.error("Binance connection error:", err);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      <WalletOption
        name="Binance Wallet"
        description="Connect via browser extension"
        icon={
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/images/wallets/binance-logo.png"
              alt="Binance Wallet Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
        }
        isInstalled={isInstalled}
        onClick={handleConnect}
        loading={loading}
        installUrl="https://www.binance.com/en/download"
      />
    </div>
  );
}