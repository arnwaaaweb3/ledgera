// src/lib/viemClient.ts
import { createPublicClient, http, fallback } from "viem";
import { bsc } from "viem/chains"; // Gunakan BSC Mainnet

const rpcUrls = [
  process.env.NEXT_PUBLIC_BNB_MAINNET_RPC,
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.org",
  "https://bsc-dataseed1.ninicoin.io",
].filter(Boolean) as string[];

export const publicClient = createPublicClient({
  chain: bsc,
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