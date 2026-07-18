"use client";

import { useState } from "react";
import Image from "next/image";
import WalletModal from "./wallets/WalletModal";

interface ConnectWalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function ConnectWalletButton({ 
  onConnect, 
  onDisconnect 
}: ConnectWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wallet_address");
    }
    return null;
  });
  const [walletType, setWalletType] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wallet_type");
    }
    return null;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = (walletAddress: string) => {
    setAddress(walletAddress);
    onConnect?.(walletAddress);
    setIsModalOpen(false);
  };

  const handleButtonClick = async () => {
    if (address) {
      // Disconnect dengan loading
      setIsLoading(true);
      try {
        // Simulasi delay disconnect (opsional)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        localStorage.removeItem("wallet_address");
        localStorage.removeItem("wallet_type");
        setAddress(null);
        setWalletType(null);
        onDisconnect?.();
      } catch (error) {
        console.error("Disconnect error:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Buka modal untuk connect
    setIsModalOpen(true);
  };

  // Tampilkan icon wallet di tombol utama pake local image
  const getWalletIcon = () => {
    if (walletType === "binance") {
      return (
        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
          <Image
            src="/images/wallets/binance-logo.png"
            alt="Binance"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      );
    } else if (walletType === "metamask") {
      return (
        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
          <Image
            src="/images/wallets/metamask-logo.png"
            alt="MetaMask"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Button Utama */}
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 
                   border rounded-lg 
                   transition-all duration-200 font-medium 
                   disabled:opacity-50
                   cursor-pointer
                   ${address 
                     ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:shadow-md" 
                     : "bg-white border-gray-300 text-brand-dark hover:bg-gray-50 hover:shadow-md"
                   }`}
      >
        {isLoading ? (
          // State Loading
          <>
            <svg 
              className="animate-spin h-5 w-5 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{address ? "Disconnecting..." : "Connecting..."}</span>
          </>
        ) : address ? (
          // State Connected
          <>
            {getWalletIcon()}
            <span>{truncateAddress(address)}</span>
          </>
        ) : (
          // State Not Connected
          <>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
              />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>

      {/* Modal */}
      <WalletModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}