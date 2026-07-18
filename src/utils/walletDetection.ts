// src/utils/walletDetection.ts

import { EthereumProvider } from '@/src/types/wallet';
import { STORAGE_KEYS, WALLET_TYPES } from '@/src/constants/wallet';
import type { WalletType } from '@/src/types/wallet';

/**
 * Get MetaMask's provider — ONLY MetaMask should own window.ethereum.
 * Guard against Phantom / other wallets that hijack window.ethereum.
 */
export const getMetaMaskProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  const eth = window.ethereum;
  if (!eth) return null;
  // Phantom (and similar) injects itself as window.ethereum and sets isMetaMask=true.
  // The ONLY reliable way to exclude Phantom is checking isPhantom first.
  if (eth.isPhantom) return null;
  if (eth.isMetaMask !== true) return null;
  return eth;
};

/**
 * Get Trust Wallet's provider — it lives on window.ethereum with isTrust=true.
 * Guard against Phantom / MetaMask hijacking the same slot.
 */
export const getTrustProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  const eth = window.ethereum;
  if (!eth) return null;
  if (eth.isTrust !== true) return null;
  return eth;
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
 */
export const detectWalletType = (provider: EthereumProvider | null): string | null => {
  if (!provider) return null;
  if (provider.isTrust) return WALLET_TYPES.TRUST;
  if (provider.isMetaMask && !provider.isPhantom) return WALLET_TYPES.METAMASK;
  if (typeof window !== 'undefined' && window.BinanceChain) return WALLET_TYPES.BINANCE;
  return null;
};
