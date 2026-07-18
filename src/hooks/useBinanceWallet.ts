// src/hooks/useBinanceWallet.ts

"use client";

import { useState, useEffect } from 'react';
import { 
  getBinanceProvider,
  isBinanceAvailable,
  getStoredAddress,
  getStoredWalletType,
  saveWalletInfo,
  clearWalletInfo,
  formatErrorMessage,
} from '@/src/utils/walletDetection';
import { WALLET_TYPES } from '@/src/constants/wallet';
import { WalletHookReturn } from '@/src/types/wallet';

export function useBinanceWallet(): WalletHookReturn {
  const [address, setAddress] = useState<string | null>(() => {
    // Cek apakah stored wallet type adalah binance
    const storedType = getStoredWalletType();
    if (storedType === WALLET_TYPES.BINANCE) {
      return getStoredAddress();
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  
  // Cek instalasi sekali di awal (tanpa re-render)
  const [isInstalled] = useState(() => {
    return isBinanceAvailable();
  });

  // Setup listeners dan cek koneksi awal
  useEffect(() => {
    let isMounted = true;
    
    const binance = getBinanceProvider();
    
    // Skip jika Binance Wallet tidak tersedia
    if (!binance) {
      return;
    }

    // Cek akun yang sudah terhubung
    const checkExistingConnection = async () => {
      try {
        const accounts = await binance.request({ method: 'eth_accounts' }) as string[];
        if (isMounted && accounts?.length > 0) {
          setAddress(accounts[0]);
        }
      } catch {
        // Silent fail - user belum connect
      }
    };

    // Cek chain ID
    const checkChainId = async () => {
      try {
        const chainIdResult = await binance.request({ method: 'eth_chainId' }) as string;
        if (isMounted) {
          setChainId(chainIdResult);
        }
      } catch {
        // Silent fail
      }
    };

    checkExistingConnection();
    checkChainId();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Connect ke Binance Wallet
   */
  const connect = async (): Promise<string> => {
    const binance = getBinanceProvider();

    // Validasi: Provider tersedia?
    if (!binance) {
      const err = 'Binance Wallet not installed. Please install it first.';
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await binance.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts?.length) {
        throw new Error('No accounts found');
      }

      const walletAddress = accounts[0];
      setAddress(walletAddress);
      saveWalletInfo(walletAddress, WALLET_TYPES.BINANCE);
      
      // Fetch chain ID setelah connect
      try {
        const chainIdResult = await binance.request({ method: 'eth_chainId' }) as string;
        setChainId(chainIdResult);
      } catch {
        // Silent fail - chain ID gak wajib
      }
      
      setLoading(false);
      return walletAddress;
      
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Disconnect dari Binance Wallet
   */
  const disconnect = (): void => {
    setAddress(null);
    setError(null);
    setChainId(null); // Reset chain ID
    clearWalletInfo();
  };

  /**
   * Switch network (Binance Wallet)
   */
  const switchNetwork = async (targetChainId: string): Promise<void> => {
    const binance = getBinanceProvider();

    if (!binance) {
      throw new Error('Binance Wallet not found');
    }

    try {
      await binance.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      // Update chainId setelah switch sukses
      setChainId(targetChainId);
    } catch (switchError) {
      // Error code 4902 = Chain belum ditambahkan
      const isChainNotAdded = 
        switchError && 
        typeof switchError === 'object' && 
        'code' in switchError && 
        switchError.code === 4902;

      if (isChainNotAdded) {
        try {
          await binance.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Custom Network',
                rpcUrls: ['https://...'],
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://...'],
              },
            ],
          });
          // Update chainId setelah add network sukses
          setChainId(targetChainId);
        } catch {
          throw new Error('Failed to add network');
        }
      } else {
        throw switchError;
      }
    }
  };

  return {
    connect,
    disconnect,
    address,
    loading,
    error,
    isInstalled,
    chainId,
    switchNetwork,
  };
}