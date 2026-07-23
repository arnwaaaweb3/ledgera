// src/lib/wallet.ts
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export interface GeneratedWallet {
  address: string;
  privateKey: string;
}

/**
 * Men-generate EVM Wallet Keypair asli yang valid di BNB Chain / EVM Networks.
 */
export function generateAutoWallet(): GeneratedWallet {
  // Generate random 32-byte private key secara kriptografis
  const privateKey = generatePrivateKey();
  
  // Turunkan alamat EVM public address dari private key tersebut
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address, // Format: 0x... (Valid Checksum EVM Address)
    privateKey: privateKey,
  };
}