import { BLOCK_PROVER_PRECOMPILE, CHAININFO_PRECOMPILE } from "@shared/multichain";
import { AttestcoinError } from "../../attestcoin/errors";
import {
  getOfficialEnvironment,
  listOfficialEnvironmentIds,
} from "./official";

const HEX20 = /^0x[0-9a-fA-F]{40}$/;
const HTTPS = /^https:\/\//;

export function validateOfficialEnvironment(environment: string): string[] {
  const errors: string[] = [];
  let descriptor;
  try {
    descriptor = getOfficialEnvironment(environment);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  for (const field of ["ascDashboardUrl", "proofBuilderUrl", "creditcoinRpcUrl"] as const) {
    if (!HTTPS.test(descriptor[field])) {
      errors.push(`${field} must use HTTPS`);
    }
  }

  for (const field of [
    "decoderContract",
    "chainInfoPrecompile",
    "blockProverPrecompile",
  ] as const) {
    if (!HEX20.test(descriptor[field])) {
      errors.push(`${field} must be a 20-byte hex address`);
    }
  }

  if (
    descriptor.blockProverPrecompile.toLowerCase() !==
    BLOCK_PROVER_PRECOMPILE.toLowerCase()
  ) {
    errors.push(
      "Block Prover Precompile address drifted from the documented 0x0FD2 address",
    );
  }
  if (
    descriptor.chainInfoPrecompile.toLowerCase() !==
    CHAININFO_PRECOMPILE.toLowerCase()
  ) {
    errors.push(
      "ChainInfo Precompile address drifted from the documented 0x0fd3 address",
    );
  }

  const chainKeys = new Map<number, string>();
  for (const chain of descriptor.chains) {
    if (!chain.chainKey && chain.chainKey !== 0) {
      errors.push(`${chain.id} is missing chainKey`);
    }
    if (!Number.isInteger(chain.chainKey) || chain.chainKey <= 0) {
      errors.push(`${chain.id} chainKey must be a positive integer`);
    }
    const existing = chainKeys.get(chain.chainKey);
    if (existing) {
      errors.push(
        `${descriptor.id} reuses chainKey ${chain.chainKey} for ${existing} and ${chain.id}`,
      );
    } else {
      chainKeys.set(chain.chainKey, chain.id);
    }
    if (!chain.rpcUrl || !HTTPS.test(chain.rpcUrl)) {
      errors.push(`${chain.id} must have HTTPS source RPC`);
    }
    if (chain.genesisBlock !== 0) {
      errors.push(`${chain.id} genesisBlock should match documented value 0`);
    }
    if (chain.support !== "official" || !chain.attestcoinEnabled) {
      errors.push(`${chain.id} must be an official Attestcoin-enabled chain`);
    }
    if (chain.environment !== descriptor.id) {
      errors.push(`${chain.id} environment does not match ${descriptor.id}`);
    }
  }

  if (descriptor.id === "cc3-testnet" && descriptor.chains.length !== 2) {
    errors.push("CC3 Testnet must document Ethereum Sepolia and Ethereum Mainnet only");
  }
  if (descriptor.id === "cc3-mainnet" && descriptor.chains.length !== 1) {
    errors.push("CC3 Mainnet must document Ethereum Mainnet only");
  }

  return errors;
}

export function assertValidOfficialEnvironment(environment: string): void {
  const errors = validateOfficialEnvironment(environment);
  if (errors.length) {
    throw new AttestcoinError("VALIDATION", errors.join("; "));
  }
}

export function validateAllOfficialEnvironments(): string[] {
  return listOfficialEnvironmentIds().flatMap(environment =>
    validateOfficialEnvironment(environment).map(
      error => `${environment}: ${error}`,
    ),
  );
}

export function assertAllOfficialEnvironmentsValid(): void {
  const errors = validateAllOfficialEnvironments();
  if (errors.length) {
    throw new AttestcoinError("VALIDATION", errors.join("; "));
  }
}
