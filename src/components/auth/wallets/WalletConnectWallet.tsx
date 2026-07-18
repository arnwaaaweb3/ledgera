// src/components/auth/wallets/WalletConnectWallet.tsx
"use client";

import { useWalletConnect } from "@/src/hooks/useWalletConnect";
import WalletOption from "./WalletOption";

interface WalletConnectWalletProps {
  onConnect: (address: string) => void;
  onClose?: () => void;
}

function WalletConnectLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#3B99FC] flex items-center justify-center overflow-hidden">
      <svg
        width="22"
        height="19"
        viewBox="0 0 318.6 240.7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="object-contain"
      >
        <path
          d="M61.6 33.8C112.7-15.9 206.3-10.9 256 33.8c47.2 42.4 51.8 116.3 14.4 173.6l25.4-15.2c45.6-70.1 39.9-163.6-15.7-224-55.6-60.4-150.3-65.2-218.5-14.6L61.6 33.8z"
          fill="white"
        />
        <path
          d="M176.8 130.7c0 6.9-5.6 12.5-12.5 12.5-3.5 0-6.6-1.4-8.9-3.7l-56.6-55.9c-3.1-3.1-8.2-3.1-11.3 0-3.1 3.1-3.1 8.2 0 11.3l56.6 55.9c5 5 13.1 5 18.1 0l56.6-55.9c3.1-3.1 3.1-8.2 0-11.3-3.1-3.1-8.2-3.1-11.3 0l-54.7 54.1c-2.2 2.2-3.7 5.3-3.7 8.5 0 3.2 1.5 6.3 3.7 8.5 4.7 4.7 12.4 4.7 17.1 0l34.8-34.3c3.1-3.1 8.2-3.1 11.3 0 3.1 3.1 3.1 8.2 0 11.3l-34.8 34.3c-11.6 11.5-30.4 11.5-42 0-5.6-5.6-8.7-13-8.7-20.9 0-7.9 3.1-15.3 8.7-20.9l54.7-54.1c8.5-8.4 22.2-8.4 30.7 0 8.4 8.5 8.4 22.2 0 30.7l-51.9 51.3c-2.2 2.2-3.7 5.3-3.7 8.5z"
          fill="white"
        />
      </svg>
    </div>
  );
}

export default function WalletConnectWallet({ onConnect, onClose }: WalletConnectWalletProps) {
  const { connect, loading, error } = useWalletConnect();

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
        icon={<WalletConnectLogo />}
        isInstalled={true}
        onClick={handleConnect}
        loading={loading}
        installUrl="https://walletconnect.com/"
      />
    </div>
  );
}
