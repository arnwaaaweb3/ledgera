// src/hooks/useMetaMaskWallet.ts

"use client";

import { useState, useEffect } from 'react';
import { 
  getEthereumProvider,
  isRealMetaMask,
  isProviderAvailable,
  getStoredAddress,
  saveWalletInfo,
  clearWalletInfo,
  formatErrorMessage,
} from '@/src/utils/walletDetection';
import { WALLET_TYPES } from '@/src/constants/wallet';
import { WalletHookReturn } from '@/src/types/wallet';

export function useMetaMaskWallet(): WalletHookReturn {
  const [address, setAddress] = useState<string | null>(getStoredAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  
  // Cek instalasi sekali di awal (tanpa re-render)
  const [isInstalled] = useState(() => {
    const provider = getEthereumProvider();
    return isRealMetaMask(provider);
  });

  // Setup listeners dan cek koneksi awal
  useEffect(() => {
    let isMounted = true;
    
    const provider = getEthereumProvider();
    
    // Skip jika bukan MetaMask asli atau tidak ada provider
    if (!isRealMetaMask(provider) || !isProviderAvailable(provider)) {
      return;
    }

    // Provider sudah dipastikan tidak null di sini
    const safeProvider = provider;

    // Cek akun yang sudah terhubung
    const checkExistingConnection = async () => {
      try {
        const accounts = await safeProvider.request({ method: 'eth_accounts' }) as string[];
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
        const chainIdResult = await safeProvider.request({ method: 'eth_chainId' }) as string;
        if (isMounted) {
          setChainId(chainIdResult);
        }
      } catch {
        // Silent fail
      }
    };

    checkExistingConnection();
    checkChainId();

    // Event handlers
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs?.length > 0) {
        setAddress(accs[0]);
        saveWalletInfo(accs[0], WALLET_TYPES.METAMASK);
      } else {
        setAddress(null);
        clearWalletInfo();
      }
    };

    const handleChainChanged = (chainIdResult: unknown) => {
      setChainId(chainIdResult as string);
      // Reload recommended by MetaMask
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    // Subscribe ke events
    safeProvider.on?.('accountsChanged', handleAccountsChanged);
    safeProvider.on?.('chainChanged', handleChainChanged);

    // Cleanup
    return () => {
      isMounted = false;
      safeProvider.removeListener?.('accountsChanged', handleAccountsChanged);
      safeProvider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  /**
   * Connect ke MetaMask
   */
  const connect = async (): Promise<string> => {
    const provider = getEthereumProvider();

    // Validasi: Provider tersedia?
    if (!isProviderAvailable(provider)) {
      const err = 'MetaMask not installed. Please install it first.';
      setError(err);
      throw new Error(err);
    }

    // Validasi: Ini MetaMask asli?
    if (!isRealMetaMask(provider)) {
      const err = 'MetaMask not detected. Please install MetaMask extension.';
      setError(err);
      throw new Error(err);
    }

    // Provider sudah dipastikan tidak null di sini
    const safeProvider = provider;

    setLoading(true);
    setError(null);

    try {
      const accounts = await safeProvider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts?.length) {
        throw new Error('No accounts found');
      }

      const walletAddress = accounts[0];
      setAddress(walletAddress);
      saveWalletInfo(walletAddress, WALLET_TYPES.METAMASK);
      
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
   * Disconnect dari MetaMask
   */
  const disconnect = (): void => {
    setAddress(null);
    setError(null);
    clearWalletInfo();
  };

  /**
   * Switch network
   */
  const switchNetwork = async (targetChainId: string): Promise<void> => {
    const provider = getEthereumProvider();

    if (!isProviderAvailable(provider)) {
      throw new Error('Ethereum provider not found');
    }

    // Provider sudah dipastikan tidak null di sini
    const safeProvider = provider;

    try {
      await safeProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError) {
      // Error code 4902 = Chain belum ditambahkan
      const isChainNotAdded = 
        switchError && 
        typeof switchError === 'object' && 
        'code' in switchError && 
        switchError.code === 4902;

      if (isChainNotAdded) {
        try {
          await safeProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Custom Network',
                rpcUrls: ['https://...'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://...'],
              },
            ],
          });
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