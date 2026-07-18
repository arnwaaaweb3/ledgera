// src/hooks/useTrustWallet.ts

"use client";

import { useState, useEffect } from 'react';
import {
  getTrustProvider,
  isTrustInstalled,
  getStoredAddress,
  getStoredWalletType,
  saveWalletInfo,
  clearWalletInfo,
  formatErrorMessage,
} from '@/src/utils/walletDetection';
import { WALLET_TYPES } from '@/src/constants/wallet';
import { WalletHookReturn } from '@/src/types/wallet';

export function useTrustWallet(): WalletHookReturn {
  const [address, setAddress] = useState<string | null>(() => {
    if (getStoredWalletType() === WALLET_TYPES.TRUST) {
      return getStoredAddress();
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  // Is Trust Wallet (not Phantom/MM masquerade) installed?
  const [isInstalled] = useState(() => isTrustInstalled());

  // Setup listeners and check existing connection
  useEffect(() => {
    let isMounted = true;

    const provider = getTrustProvider();
    if (!provider) return;

    const checkExistingConnection = async () => {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (isMounted && accounts?.length > 0) {
          setAddress(accounts[0]);
        }
      } catch {
        // Silent fail
      }
    };

    const checkChainId = async () => {
      try {
        const result = await provider.request({ method: 'eth_chainId' }) as string;
        if (isMounted) setChainId(result);
      } catch {
        // Silent fail
      }
    };

    checkExistingConnection();
    checkChainId();

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs?.length > 0) {
        setAddress(accs[0]);
        saveWalletInfo(accs[0], WALLET_TYPES.TRUST);
      } else {
        setAddress(null);
        clearWalletInfo();
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(newChainId as string);
      if (typeof window !== 'undefined') window.location.reload();
    };

    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      isMounted = false;
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      provider.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = async (): Promise<string> => {
    const provider = getTrustProvider();

    if (!provider) {
      const err = 'Trust Wallet not installed. Please install it first.';
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts?.length) throw new Error('No accounts found');

      const walletAddress = accounts[0];
      setAddress(walletAddress);
      saveWalletInfo(walletAddress, WALLET_TYPES.TRUST);

      try {
        const result = await provider.request({ method: 'eth_chainId' }) as string;
        setChainId(result);
      } catch {
        // Chain ID is optional
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

  const disconnect = (): void => {
    setAddress(null);
    setError(null);
    setChainId(null);
    clearWalletInfo();
  };

  const switchNetwork = async (targetChainId: string): Promise<void> => {
    const provider = getTrustProvider();
    if (!provider) throw new Error('Trust Wallet provider not found');

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      setChainId(targetChainId);
    } catch (switchError) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Custom Network',
                rpcUrls: ['https://...'],
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                blockExplorerUrls: ['https://...'],
              },
            ],
          });
          setChainId(targetChainId);
        } catch {
          throw new Error('Failed to add network');
        }
      } else {
        throw switchError;
      }
    }
  };

  return { connect, disconnect, address, loading, error, isInstalled, chainId, switchNetwork };
}
