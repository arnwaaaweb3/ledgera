// src/utils/walletDetection.ts

import { EthereumProvider, WalletType } from '@/src/types/wallet';
import { NON_METAMASK_FLAGS, STORAGE_KEYS, WALLET_TYPES } from '@/src/constants/wallet';

/**
 * Cek apakah ada provider Ethereum di window
 */
export const getEthereumProvider = (): EthereumProvider | null => {
  if (typeof window === 'undefined') return null;
  return window.ethereum || null;
};

/**
 * Cek apakah ada Binance Wallet di window
 */
export const getBinanceProvider = () => {
  if (typeof window === 'undefined') return null;
  return window.BinanceChain || null;
};

/**
 * Cek apakah Binance Wallet tersedia
 */
export const isBinanceAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.BinanceChain;
};

/**
 * Cek apakah provider adalah MetaMask ASLI
 */
export const isRealMetaMask = (provider: EthereumProvider | null): boolean => {
  if (!provider) return false;
  
  return (
    provider.isMetaMask === true &&
    !NON_METAMASK_FLAGS.some(flag => provider[flag] === true)
  );
};

/**
 * Cek apakah provider ada dan valid
 */
export const isProviderAvailable = (provider: EthereumProvider | null): provider is EthereumProvider => {
  return provider !== null && typeof provider.request === 'function';
};

/**
 * Get wallet address from localStorage
 */
export const getStoredAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
};

/**
 * Get wallet type from localStorage
 */
export const getStoredWalletType = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.WALLET_TYPE);
};

/**
 * Save wallet info to localStorage
 */
export const saveWalletInfo = (address: string, type: WalletType): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
  localStorage.setItem(STORAGE_KEYS.WALLET_TYPE, type);
};

/**
 * Clear wallet info from localStorage
 */
export const clearWalletInfo = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.WALLET_TYPE);
};

/**
 * Format error message
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

/**
 * Check if provider is installed (by checking specific flag)
 */
export const isWalletInstalled = (provider: EthereumProvider | null, walletType: string): boolean => {
  if (!provider) return false;
  
  switch (walletType) {
    case WALLET_TYPES.METAMASK:
      return isRealMetaMask(provider);
    case WALLET_TYPES.BINANCE:
      return isBinanceAvailable();
    default:
      return false;
  }
};