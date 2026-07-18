// src/hooks/useMetaMaskWallet.ts

"use client";

import { useState, useEffect } from 'react';
import {
  getMetaMaskProvider,
  isMetaMaskInstalled,
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

  // Is MetaMask (not Phantom) installed?
  const [isInstalled] = useState(() => isMetaMaskInstalled());

  // Setup listeners and check existing connection
  useEffect(() => {
    let isMounted = true;

    const provider = getMetaMaskProvider();

    if (!provider) return;

    // Check already-connected accounts
    const checkExistingConnection = async () => {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        if (isMounted && accounts?.length > 0) {
          setAddress(accounts[0]);
        }
      } catch {
        // Silent fail — user hasn't connected yet
      }
    };

    // Check chain ID
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
        saveWalletInfo(accs[0], WALLET_TYPES.METAMASK);
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
    const provider = getMetaMaskProvider();

    if (!provider) {
      const err = 'MetaMask not installed. Please install it first.';
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
      saveWalletInfo(walletAddress, WALLET_TYPES.METAMASK);

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
    clearWalletInfo();
  };

  const switchNetwork = async (targetChainId: string): Promise<void> => {
    const provider = getMetaMaskProvider();
    if (!provider) throw new Error('MetaMask provider not found');

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
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
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
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

  return { connect, disconnect, address, loading, error, isInstalled, chainId, switchNetwork };
}
