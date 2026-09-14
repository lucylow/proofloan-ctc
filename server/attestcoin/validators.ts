import { isAddressShapedIdentity, isLiveTxHash } from "@shared/proofloan";
import { isAttestcoinSourceChainName } from "@shared/multichain";
import type { AttestcoinSourceChain } from "@shared/attestcoin";

export function normalizeTxHash(value: string) {
  return value.trim().toLowerCase();
}

export function assertLiveTxHash(value: string) {
  const txHash = normalizeTxHash(value);
  if (!isLiveTxHash(txHash)) {
    throw new Error("Attestcoin requires a full 32-byte transaction hash.");
  }
  return txHash;
}

export function assertWalletAddress(value: string) {
  const address = value.trim();
  if (!isAddressShapedIdentity(address)) {
    throw new Error("Wallet address is not address-shaped.");
  }
  return address;
}

export function assertSourceChain(value: string): AttestcoinSourceChain {
  if (!isAttestcoinSourceChainName(value)) {
    throw new Error(`Unsupported Attestcoin source chain: ${value}`);
  }
  return value;
}

export function validateProofBlock(
  sourceBlock: number,
  verificationBlock: number,
) {
  if (!Number.isInteger(sourceBlock) || sourceBlock <= 0) {
    throw new Error("Attestcoin source block is invalid.");
  }

  if (!Number.isInteger(verificationBlock) || verificationBlock <= 0) {
    throw new Error("Attestcoin verification block is invalid.");
  }

  return verificationBlock >= sourceBlock;
}
