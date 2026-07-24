// src/lib/adapters/index.ts
import { IIdrStablecoinAdapter } from "./types";
import { IDRXAdapter } from "./idrx";
import { IDRTAdapter } from "./idrt";
import { formatUnits } from "viem";

class IdrAdapterRegistry {
  private adapters: Map<string, IIdrStablecoinAdapter> = new Map();

  constructor() {
    this.register(new IDRXAdapter());
    this.register(new IDRTAdapter());
  }

  public register(adapter: IIdrStablecoinAdapter) {
    this.adapters.set(adapter.metadata.symbol.toUpperCase(), adapter);
  }

  public getAdapter(symbol: string): IIdrStablecoinAdapter {
    return this.adapters.get(symbol.toUpperCase()) || this.adapters.get("IDRX")!;
  }

  // 💥 RUMUS AKUMULASI ASSET KUMULATIF (Asset = IDRX + IDRT)
  public async getCumulativeBalanceInRupiah(walletAddress: string): Promise<number> {
    let totalRupiah = 0;

    for (const adapter of this.adapters.values()) {
      const rawBalance = await adapter.getBalance(walletAddress);
      const floatAmount = Number(formatUnits(rawBalance, adapter.metadata.decimals));
      totalRupiah += floatAmount;
    }

    return totalRupiah;
  }
}

export const idrAdapterRegistry = new IdrAdapterRegistry();
export * from "./types";