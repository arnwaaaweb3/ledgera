// src/hooks/useWalletConnect.ts

"use client";

import { useState, useCallback, useRef } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import {
  getStoredAddress,
  getStoredWalletType,
  saveWalletInfo,
  clearWalletInfo,
  formatErrorMessage,
} from '@/src/utils/walletDetection';
import { WALLET_TYPES } from '@/src/constants/wallet';
import { WalletHookReturn } from '@/src/types/wallet';

const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export function useWalletConnect(): WalletHookReturn {
  const [address, setAddress] = useState<string | null>(() => {
    if (getStoredWalletType() === WALLET_TYPES.WALLET_CONNECT) {
      return getStoredAddress();
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  // Keep a ref so disconnect() can clean up the active provider
  const providerRef = useRef<InstanceType<typeof EthereumProvider> | null>(null);

  const connect = useCallback(async (): Promise<string> => {
    if (!WALLETCONNECT_PROJECT_ID) {
      const err = 'WalletConnect Project ID is not configured.';
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [1], // Ethereum mainnet — add more chain IDs as needed
        showQrModal: true,
        methods: ['eth_requestAccounts', 'eth_chainId', 'eth_accounts'],
        events: ['accountsChanged', 'chainChanged'],
        metadata: {
          name: 'Coinspace',
          description: 'Connect to Coinspace',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://coinspace.com',
          icons: [
            typeof window !== 'undefined'
              ? `${window.location.origin}/favicon.ico`
              : 'https://coinspace.com/favicon.ico',
          ],
        },
      });

      providerRef.current = provider;

      // Enable session → opens QR modal / deep link
      await provider.enable();

      const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];

      if (!accounts?.length) throw new Error('No accounts found');

      const walletAddress = accounts[0];
      setAddress(walletAddress);
      saveWalletInfo(walletAddress, WALLET_TYPES.WALLET_CONNECT);

      // Listen for account changes
      provider.on('accountsChanged', (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs?.length > 0) {
          setAddress(accs[0]);
          saveWalletInfo(accs[0], WALLET_TYPES.WALLET_CONNECT);
        } else {
          setAddress(null);
          clearWalletInfo();
        }
      });

      provider.on('chainChanged', (newChainId: unknown) => {
        setChainId(newChainId as string);
      });

      // Fetch current chain
      try {
        const result = (await provider.request({ method: 'eth_chainId' })) as string;
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
      providerRef.current = null;
      throw new Error(errorMessage);
    }
  }, []);

  const disconnect = useCallback((): void => {
    providerRef.current = null;
    setAddress(null);
    setError(null);
    setChainId(null);
    clearWalletInfo();
  }, []);

  const switchNetwork = useCallback(
    async (targetChainId: string): Promise<void> => {
      if (!address) throw new Error('WalletConnect not connected');
      setChainId(targetChainId);
    },
    [address]
  );

  return { connect, disconnect, address, loading, error, isInstalled: true, chainId, switchNetwork };
}
