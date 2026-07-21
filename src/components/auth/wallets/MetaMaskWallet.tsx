// src/components/auth/wallets/MetaMaskWallet.tsx
"use client";

import Image from "next/image";
import { useMetaMaskWallet } from "@/src/hooks/useMetaMaskWallet";
import WalletOption from "./WalletOption";

interface MetaMaskWalletProps {
  onConnect: (address: string) => void;
  onClose?: () => void;
}

export default function MetaMaskWallet({ onConnect, onClose }: MetaMaskWalletProps) {
  const { connect, loading, isInstalled, error } = useMetaMaskWallet();

  const handleConnect = async () => {
    try {
      const address = await connect();
      onConnect(address);
      onClose?.();
    } catch (err) {
      console.error("MetaMask connection error:", err);
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
        name="MetaMask"
        description="Connect via browser extension"
        icon={
          <div className="w-8 h-8 rounded-lg bg-[#000000] flex items-center justify-center overflow-hidden p-1">
            <Image
              src="/images/wallets/metamask-logo.png"
              alt="MetaMask Wallet Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
        }
        isInstalled={isInstalled}
        onClick={handleConnect}
        loading={loading}
        installUrl="https://metamask.io/download/"
      />
    </div>
  );
}