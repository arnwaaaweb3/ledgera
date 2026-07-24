// src/lib/adapters/idrt.ts
import { IIdrStablecoinAdapter, IdrTokenMetadata } from "./types";
import { parseUnits, formatUnits, getAddress } from "viem";
import { publicClient, erc20Abi } from "@/src/lib/viemClient";

const DEFAULT_IDRT_ADDRESS = "0x2b34b49071c50d97d87b1c3125dd48ee3e7eebb0";

export class IDRTAdapter implements IIdrStablecoinAdapter {
  readonly metadata: IdrTokenMetadata;

  constructor() {
    const rawAddress = process.env.NEXT_PUBLIC_IDRT_CONTRACT_ADDRESS || DEFAULT_IDRT_ADDRESS;
    // Fix checksum address issue menggunakan getAddress()
    const checksumAddress = getAddress(rawAddress);

    this.metadata = {
      symbol: "IDRT",
      name: "Rupiah Token (IDRT)",
      issuer: "PT Rupiah Token Indonesia",
      decimals: 2,
      chainId: 97,
      contractAddress: checksumAddress,
    };
  }

  formatToRupiah(rawAmount: bigint | string): string {
    const formatted = formatUnits(BigInt(rawAmount), this.metadata.decimals);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(formatted));
  }

  parseFromRupiah(rupiahAmount: number | string): bigint {
    return parseUnits(rupiahAmount.toString(), this.metadata.decimals);
  }

  async getBalance(walletAddress: string): Promise<bigint> {
    try {
      if (!walletAddress || !walletAddress.startsWith("0x")) return BigInt(0);

      const validUserAddress = getAddress(walletAddress);

      const rawBalance = await publicClient.readContract({
        address: this.metadata.contractAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [validUserAddress],
      });

      return rawBalance;
    } catch (error) {
      console.warn("⚠️ [IDRT Adapter] RPC unreachable or contract not deployed on this network:", error);
      return BigInt(0); // Return 0 gracefully
    }
  }
}