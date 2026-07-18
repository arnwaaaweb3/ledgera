// src/components/auth/wallets/TrustWallet.tsx

"use client";

import Image from "next/image";
import { useTrustWallet } from "@/src/hooks/useTrustWallet";
import WalletOption from "./WalletOption";

interface TrustWalletProps {
  onConnect: (address: string) => void;
  onClose?: () => void;
}

export default function TrustWallet({ onConnect, onClose }: TrustWalletProps) {
  const { connect, loading, isInstalled, error } = useTrustWallet();

  const handleConnect = async () => {
    try {
      const address = await connect();
      onConnect(address);
      onClose?.();
    } catch (err) {
      console.error("Trust Wallet connection error:", err);
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
        name="Trust Wallet"
        icon={
          <div className="w-8 h-8 bg-[#000000] rounded-lg flex items-center justify-center overflow-hidden">
            <Image 
              src="/images/wallets/trust-wallet-logo.png"
              alt="Trust Wallet Logo"
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
        installUrl="https://trustwallet.com/download"
      />
    </div>
  );
}