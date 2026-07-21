// src/utils/walletDetection.ts

import { EthereumProvider } from '@/src/types/wallet';
import { STORAGE_KEYS, WALLET_TYPES } from '@/src/constants/wallet';
import type { WalletType } from '@/src/types/wallet';

// Phantom-specific provider interface - Phantom injects into window.phantom.ethereum
interface PhantomEthereumProvider extends EthereumProvider {
  isPhantom?: boolean;
  isMetaMask?: boolean;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get Phantom's provider — Phantom injects itself as:
 * 1. window.phantom.ethereum (primary, Phantom-specific)
 * 2. window.ethereum with isPhantom=true (for compatibility)
 * We check both slots, preferring window.phantom.ethereum.
 */
export const getPhantomProvider = (): PhantomEthereumProvider | null => {
  if (!isBrowser) return null;

  // Check window.phantom.ethereum first (Phantom's primary injection slot)
  const phantomSlot = (window as unknown as { phantom?: { ethereum?: PhantomEthereumProvider } }).phantom;
  if (phantomSlot?.ethereum) {
    return phantomSlot.ethereum;
  }

  // Fallback: window.ethereum with isPhantom flag
  const eth = window.ethereum;
  if (eth && (eth as PhantomEthereumProvider).isPhantom) {
    return eth as PhantomEthereumProvider;
  }

  return null;
};

/**
 * Is Phantom wallet extension installed?
 * Checks both window.phantom.ethereum and window.ethereum with isPhantom flag.
 */
export const isPhantomInstalled = (): boolean => {
  return getPhantomProvider() !== null;
};

/**
 * Get MetaMask's provider — ONLY MetaMask should own window.ethereum.
 * Guard against Phantom / other wallets that hijack window.ethereum.
 *
 * Phantom sets BOTH isPhantom=true AND isMetaMask=true to "piggyback" on
 * MetaMask-aware dapps. By checking isPhantom FIRST, we correctly exclude Phantom.
 * Also guard against Phantom's window.phantom.ethereum slot.
 */
export const getMetaMaskProvider = (): EthereumProvider | null => {
  if (!isBrowser) return null;

  const eth = window.ethereum;
  if (!eth) return null;

  // Phantom injects into window.phantom.ethereum — guard against it here too.
  const phantomSlot = (window as unknown as { phantom?: { ethereum?: unknown } }).phantom;
  if (phantomSlot?.ethereum) return null;

  // Phantom also sets isPhantom=true on window.ethereum
  if ((eth as PhantomEthereumProvider).isPhantom) return null;

  // Real MetaMask sets isMetaMask=true and NOT isPhantom
  if ((eth as PhantomEthereumProvider).isMetaMask !== true) return null;

  return eth;
};

/**
 * Get Trust Wallet's provider — it lives on window.ethereum with isTrust=true.
 * Guard against Phantom / MetaMask hijacking the same slot.
 * Also check window.trustWallet if available.
 */
export const getTrustProvider = (): EthereumProvider | null => {
  if (!isBrowser) return null;

  // Check window.trustWallet.ethereum first (Trust's primary slot)
  const trustSlot = (window as unknown as { trustWallet?: { ethereum?: EthereumProvider } }).trustWallet;
  if (trustSlot?.ethereum) {
    return trustSlot.ethereum;
  }

  // Fallback: window.ethereum with isTrust flag
  const eth = window.ethereum;
  if (!eth) return null;

  // Guard against Phantom's window.phantom.ethereum
  const phantomSlot = (window as unknown as { phantom?: { ethereum?: unknown } }).phantom;
  if (phantomSlot?.ethereum) return null;

  // Guard against Phantom setting isPhantom on window.ethereum
  if ((eth as PhantomEthereumProvider).isPhantom) return null;

  if ((eth as { isTrust?: boolean }).isTrust === true) {
    return eth;
  }

  return null;
};

/**
 * Get Binance Wallet's provider — owns window.BinanceChain exclusively.
 */
export const getBinanceProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  const bc = window.BinanceChain;
  if (!bc) return null;
  return bc as EthereumProvider;
};

/**
 * Legacy alias — kept so existing imports don't break.
 */
export const getEthereumProvider = getMetaMaskProvider;

/**
 * Is MetaMask extension installed and NOT a Phantom masquerade?
 */
export const isMetaMaskInstalled = (): boolean => {
  return getMetaMaskProvider() !== null;
};

/**
 * Is Binance Wallet extension installed?
 */
export const isBinanceInstalled = (): boolean => {
  return getBinanceProvider() !== null;
};

/**
 * Is Trust Wallet extension installed and NOT a Phantom/MM masquerade?
 */
export const isTrustInstalled = (): boolean => {
  return getTrustProvider() !== null;
};

/**
 * Legacy alias — use isMetaMaskInstalled instead.
 */
export const isRealMetaMask = (provider: EthereumProvider | null): boolean => {
  if (!provider) return false;
  if (provider.isPhantom) return false;
  return provider.isMetaMask === true && typeof provider.request === 'function';
};

/**
 * Legacy alias — use isTrustInstalled instead.
 */
export const isRealTrustWallet = (provider: EthereumProvider | null): boolean => {
  if (!provider) return false;
  if (provider.isPhantom) return false;
  return provider.isTrust === true;
};

/**
 * Legacy alias — use isBinanceInstalled instead.
 */
export const isBinanceAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.BinanceChain;
};

/**
 * Generic provider availability check.
 */
export const isProviderAvailable = (
  provider: EthereumProvider | null
): provider is EthereumProvider => {
  return provider !== null && typeof provider.request === 'function';
};

/**
 * Get stored wallet address from localStorage.
 */
export const getStoredAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
};

/**
 * Get stored wallet type from localStorage.
 */
export const getStoredWalletType = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_TYPE);
};

/**
 * Save wallet info to localStorage.
 */
export const saveWalletInfo = (address: string, type: WalletType): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
  localStorage.setItem(STORAGE_KEYS.WALLET_TYPE, type);
};

/**
 * Clear wallet info from localStorage.
 */
export const clearWalletInfo = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.WALLET_TYPE);
};

/**
 * Format error message from unknown type.
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

/**
 * Detect wallet type from the active provider.
 * Check both window.ethereum and wallet-specific slots like window.phantom.ethereum.
 */
export const detectWalletType = (provider: EthereumProvider | null): string | null => {
  if (!provider) return null;

  // Check window.phantom.ethereum slot first
  if (provider === getPhantomProvider()) {
    const phantomSlot = (window as unknown as { phantom?: { ethereum?: unknown } }).phantom;
    if (phantomSlot?.ethereum === provider) {
      return WALLET_TYPES.PHANTOM;
    }
  }

  if ((provider as PhantomEthereumProvider).isPhantom) return WALLET_TYPES.PHANTOM;
  if ((provider as { isTrust?: boolean }).isTrust) return WALLET_TYPES.TRUST;
  // isMetaMask check is intentionally AFTER isPhantom — Phantom sets BOTH flags.
  if ((provider as PhantomEthereumProvider).isMetaMask && !(provider as PhantomEthereumProvider).isPhantom) return WALLET_TYPES.METAMASK;
  if (typeof window !== 'undefined' && window.BinanceChain) return WALLET_TYPES.BINANCE;
  return null;
};
