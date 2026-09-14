import { DEFAULT_MAX_MERKLE_SIBLINGS, DEFAULT_MAX_TX_BYTES } from "./constants";
import type { ProofEnvelope, ProvingRequest } from "./types";

export interface ValidationIssue {
  code: string;
  message: string;
  fatal: boolean;
}

export function validateRequest(request: ProvingRequest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Number.isInteger(request.target.chainKey) || request.target.chainKey < 0) {
    issues.push({
      code: "INVALID_CHAIN_KEY",
      message: "chainKey must be a non-negative integer",
      fatal: true,
    });
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(request.target.txHash)) {
    issues.push({
      code: "INVALID_TX_HASH",
      message: "txHash must be a 32-byte hex value",
      fatal: true,
    });
  }
  if (request.maxTransactionBytes <= 0 || request.maxTransactionBytes > DEFAULT_MAX_TX_BYTES) {
    issues.push({
      code: "INVALID_MAX_TX_BYTES",
      message: "maxTransactionBytes exceeds safe protocol limit",
      fatal: true,
    });
  }
  if (request.deadlineMs <= 0) {
    issues.push({
      code: "INVALID_DEADLINE",
      message: "deadlineMs must be positive",
      fatal: true,
    });
  }
  return issues;
}

export function validateEnvelope(envelope: ProofEnvelope): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (envelope.transaction.byteLength > DEFAULT_MAX_TX_BYTES) {
    issues.push({
      code: "TX_TOO_LARGE",
      message: "Encoded transaction exceeds the supported proof size boundary",
      fatal: true,
    });
  }
  if (envelope.merkleProof.siblings.length > DEFAULT_MAX_MERKLE_SIBLINGS) {
    issues.push({
      code: "MERKLE_DEPTH_UNUSUAL",
      message: "Merkle proof depth is unusually large",
      fatal: false,
    });
  }
  if (envelope.continuityProof.hashCount !== envelope.continuityProof.roots.length) {
    issues.push({
      code: "CONTINUITY_COUNT_MISMATCH",
      message: "continuity hash count does not match root count",
      fatal: true,
    });
  }
  if (envelope.continuityProof.endBlock < envelope.continuityProof.startBlock) {
    issues.push({
      code: "CONTINUITY_RANGE_INVALID",
      message: "continuity range is inverted",
      fatal: true,
    });
  }
  return issues;
}
