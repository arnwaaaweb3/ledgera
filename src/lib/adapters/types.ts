// src/lib/adapters/types.ts
export interface IdrTokenMetadata {
  symbol: string;
  name: string;
  issuer: string;
  decimals: number;
  chainId: number;
  contractAddress: `0x${string}`;
}

export interface IIdrStablecoinAdapter {
  readonly metadata: IdrTokenMetadata;
  formatToRupiah(rawAmount: bigint | string): string;
  parseFromRupiah(rupiahAmount: number | string): bigint;
  getBalance(walletAddress: string): Promise<bigint>; // Mengembalikan saldo dalam BigInt desimal penuh
}