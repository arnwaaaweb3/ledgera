// src/constants/wallet.ts

export const NON_METAMASK_FLAGS = [
  'isPhantom',
  'isTrust',
  'isCoinbaseWallet',
  'isBraveWallet',
  'isOpera',
  'isStatus',
  'isToshi',
  'isFrame',
  'isBitKeep',
  'isTokenPocket',
  'isSafePal',
  'isMathWallet',
  'isBybit',
  'isOKXWallet',
  'isBitpie',
  'isImToken',
  'isHaloWallet',
  'isOneKey',
  'isWalletConnect',
] as const;

export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  WALLET_TYPE: 'wallet_type',
} as const;

export const WALLET_TYPES = {
  METAMASK: 'metamask',
  BINANCE: 'binance',
  PHANTOM: 'phantom',
  TRUST: 'trust',
  COINBASE: 'coinbase',
} as const;