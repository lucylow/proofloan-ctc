import { hashValue } from "../underwriting";

export function proofFingerprint(input: {
  chainKey: number;
  sourceBlock: number;
  txHash: string;
  proofRoot: string;
}) {
  return hashValue({
    namespace: "proofloan:attestcoin:v2",
    ...input,
  });
}

export function requestFingerprint(input: {
  chain: string;
  txHash: string;
  environment?: string;
  idempotencyKey?: string;
}) {
  return hashValue({
    namespace: "proofloan:attestcoin:request",
    environment: input.environment ?? null,
    chain: input.chain,
    txHash: input.txHash.toLowerCase(),
    idempotencyKey: input.idempotencyKey ?? null,
  });
}
