import { describe, expect, it } from "vitest";
import { AttestcoinProofService } from "../attestcoin/proofService";
import { verifyTransactionWithAttestcoin } from "../attestcoin/compat";
import { buildPreviewBundle } from "../attestcoin/preview";
import { POLYGON_AMOY_LIVE_PROOF_REJECTION } from "@shared/multichain";
import { AttestcoinError } from "../attestcoin/errors";

const LIVE_HASH = `0x${"cd".repeat(32)}`;

describe("registry-driven Attestcoin adapter", () => {
  it("rejects a live Polygon Amoy proof before contacting RPC or the proof builder", async () => {
    const service = new AttestcoinProofService();
    await expect(
      service.generate({
        txHash: LIVE_HASH,
        sourceChain: "Polygon Amoy",
      }),
    ).rejects.toMatchObject({
      kind: "UNSUPPORTED_CHAIN",
      message: POLYGON_AMOY_LIVE_PROOF_REJECTION,
    });

    await expect(
      verifyTransactionWithAttestcoin(LIVE_HASH, "Polygon Amoy"),
    ).rejects.toBeInstanceOf(AttestcoinError);
  });

  it("still builds preview bundles for experimental Polygon Amoy", () => {
    const bundle = buildPreviewBundle(
      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "Polygon Amoy",
    );
    expect(bundle.receipt.mode).toBe("preview");
    expect(bundle.receipt.verified).toBe(false);
    expect(bundle.facts.every(fact => !fact.sourceVerified)).toBe(true);
    expect(bundle.receipt.warnings.some(warning => warning.includes("experimental"))).toBe(true);
  });
});
