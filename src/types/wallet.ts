// src/types/wallet.ts

import { WALLET_TYPES } from '@/src/constants/wallet';

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  selectedAddress?: string | null;
  isConnected?: () => boolean;
  providers?: unknown[];
  // Wallet flags
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isOpera?: boolean;
  isStatus?: boolean;
  isToshi?: boolean;
  isFrame?: boolean;
  isBitKeep?: boolean;
  isTokenPocket?: boolean;
  isSafePal?: boolean;
  isMathWallet?: boolean;
  isBybit?: boolean;
  isOKXWallet?: boolean;
  isBitpie?: boolean;
  isImToken?: boolean;
  isHaloWallet?: boolean;
  isOneKey?: boolean;
  isWalletConnect?: boolean;
  [key: string]: unknown;
}

export interface BinanceProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export interface WalletHookReturn {
  connect: () => Promise<string>;
  disconnect: () => void;
  address: string | null;
  loading: boolean;
  error: string | null;
  isInstalled: boolean;
  chainId: string | null;
  switchNetwork: (chainId: string) => Promise<void>;
}

export interface WalletStorage {
  address: string | null;
  type: string | null;
}

// Type untuk wallet type
export type WalletType = typeof WALLET_TYPES[keyof typeof WALLET_TYPES];

// Deklarasi global untuk window
declare global {
  interface Window {
    ethereum?: EthereumProvider;
    BinanceChain?: BinanceProvider;
  }
}