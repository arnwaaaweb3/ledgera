// src/components/auth/wallets/WalletConnectWallet.tsx

"use client";

import Image from "next/image";
import { useWalletConnect } from "@/src/hooks/useWalletConnect";
import WalletOption from "./WalletOption";

interface WalletConnectWalletProps {
  onConnect: (address: string) => void;
  onClose?: () => void;
}

export default function WalletConnectWallet({ onConnect, onClose }: WalletConnectWalletProps) {
  const { connect, loading, isInstalled, error } = useWalletConnect();

  const handleConnect = async () => {
    try {
      const address = await connect();
      onConnect(address);
      onClose?.();
    } catch (err) {
      console.error("WalletConnect connection error:", err);
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
        name="WalletConnect"
        description="Scan QR code with your mobile wallet"
        icon={
          <div className="w-8 h-8 bg-[#000000] rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/images/wallets/walletconnect-logo.png"
              alt="WalletConnect Logo"
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
        installUrl="https://walletconnect.com/"
      />
    </div>
  );
}