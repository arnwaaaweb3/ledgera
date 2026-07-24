// src/lib/adapters/idrx.ts
import { IIdrStablecoinAdapter, IdrTokenMetadata } from "./types";
import { parseUnits, formatUnits, getAddress } from "viem";
import { publicClient, erc20Abi } from "@/src/lib/viemClient";

const DEFAULT_IDRX_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

export class IDRXAdapter implements IIdrStablecoinAdapter {
  readonly metadata: IdrTokenMetadata;

  constructor() {
    const rawAddress = process.env.NEXT_PUBLIC_IDRX_CONTRACT_ADDRESS || DEFAULT_IDRX_ADDRESS;
    // Format alamat agar lolos EIP-55 Checksum Validation
    const checksumAddress = getAddress(rawAddress);

    this.metadata = {
      symbol: "IDRX",
      name: "IDRX Stablecoin",
      issuer: "IDRX Platform",
      decimals: 18,
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
      console.warn("⚠️ [IDRX Adapter] RPC unreachable or contract not deployed on this network:", error);
      return BigInt(0); // Return 0 gracefully tanpa crash
    }
  }
}