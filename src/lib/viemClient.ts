// src/lib/viemClient.ts
import { createPublicClient, http, fallback } from "viem";
import { bscTestnet } from "viem/chains";

// Kumpulan Public RPC Endpoints BNB Chain Testnet yang Stabil
const rpcUrls = [
  process.env.NEXT_PUBLIC_BNB_TESTNET_RPC,
  "https://bsc-testnet.blockpi.network/v1/rpc/public",
  "https://data-seed-prebsc-2-s1.binance.org:8545",
  "https://data-seed-prebsc-1-s1.binance.org:8545",
  "https://bsc-testnet.publicnode.com",
].filter(Boolean) as string[];

export const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: fallback(rpcUrls.map((url) => http(url, { timeout: 8000 }))),
});

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;