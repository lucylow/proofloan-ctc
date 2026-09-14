import { createPublicKey, verify as nodeVerify } from "node:crypto";
import type { AttestorSignature } from "@shared/attestors";
import { validateSignature } from "./validation";

export interface AttestorSignatureVerifier {
  verify(signature: AttestorSignature, digest: string): boolean;
}

/**
 * Canonical verifier boundary. The production Attestcoin precompile performs
 * protocol-native verification; this adapter keeps the application layer from
 * inventing consensus rules. ECDSA verification is provided for local tests.
 */
export class EcdsaAttestorSignatureVerifier implements AttestorSignatureVerifier {
  verify(signature: AttestorSignature, digest: string): boolean {
    try {
      validateSignature(signature);
      if (signature.algorithm !== "ecdsa") return false;
      const key = createPublicKey({ key: Buffer.from(signature.publicKey.slice(2), "hex"), format: "der", type: "spki" });
      return nodeVerify("sha256", Buffer.from(digest), key, Buffer.from(signature.signature.slice(2), "hex"));
    } catch {
      return false;
    }
  }
}

export class ProtocolDelegatedSignatureVerifier implements AttestorSignatureVerifier {
  constructor(private readonly delegate: (signature: AttestorSignature, digest: string) => Promise<boolean> | boolean) {}
  verify(signature: AttestorSignature, digest: string): boolean {
    // Protocol verification is async; the synchronous interface deliberately
    // refuses to guess. Use verifyAsync for the actual adapter.
    void signature;
    void digest;
    return false;
  }
  async verifyAsync(signature: AttestorSignature, digest: string): Promise<boolean> {
    validateSignature(signature);
    return Boolean(await this.delegate(signature, digest));
  }
}

export function deterministicTestSignature(operatorId: string, digest: string): AttestorSignature {
  return {
    operatorId,
    algorithm: "ecdsa",
    publicKey: `0x${operatorId.padEnd(64, "0").slice(0, 64)}`,
    signature: `0x${digest.slice(2).padEnd(128, "0").slice(0, 128)}`,
    signedDigest: digest,
    signedAt: new Date().toISOString(),
  };
}
