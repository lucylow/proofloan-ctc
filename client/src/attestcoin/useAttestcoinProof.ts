import { useCallback, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { normalizeAttestcoinClientError } from "./error";
import type { AttestcoinProofProgress } from "./types";
import type { AttestcoinSourceChain } from "@shared/attestcoin";

export function useAttestcoinProof() {
  const [progress, setProgress] =
    useState<AttestcoinProofProgress>({
      state: "idle",
      label: "Ready",
      progress: 0,
    });

  const inFlight = useRef(false);

  const prove = trpc.attestcoin.prove.useMutation();

  const run = useCallback(
    async (input: {
      txHash: string;
      sourceChain: AttestcoinSourceChain;
      allowPreviewFallback?: boolean;
    }) => {
      if (inFlight.current) {
        throw new Error("An Attestcoin proof request is already running.");
      }

      inFlight.current = true;
      const requestId =
        input.txHash.slice(2, 10) + "_" + Date.now().toString(36);

      try {
        setProgress({
          state: "validating",
          label: "Validating source transaction",
          progress: 12,
          requestId,
        });

        if (!/^0x[0-9a-fA-F]{64}$/.test(input.txHash.trim())) {
          throw new Error("Enter a complete 32-byte source transaction hash.");
        }

        setProgress({
          state: "fetching",
          label: "Requesting Attestcoin proof",
          progress: 36,
          requestId,
        });

        const result = await prove.mutateAsync({
          txHash: input.txHash,
          sourceChain: input.sourceChain,
          requestId,
          allowPreviewFallback:
            input.allowPreviewFallback ?? false,
          forceRefresh: false,
        });

        setProgress({
          state: "verifying",
          label: "Verifying proof on Creditcoin",
          progress: 82,
          requestId,
        });

        const complete = {
          state: result.receipt.mode === "preview" ? "preview" : "complete",
          label:
            result.receipt.mode === "preview"
              ? "Preview proof ready"
              : "Attestcoin proof verified",
          progress: 100,
          requestId,
        } satisfies AttestcoinProofProgress;

        setProgress(complete);

        return result;
      } catch (error) {
        const normalized =
          normalizeAttestcoinClientError(error);

        setProgress({
          state: "error",
          label: normalized.retriable
            ? "Recoverable proof error"
            : "Proof request failed",
          progress: 0,
          requestId,
          error: normalized,
        });

        throw error;
      } finally {
        inFlight.current = false;
      }
    },
    [prove],
  );

  const reset = () => {
    setProgress({
      state: "idle",
      label: "Ready",
      progress: 0,
    });
  };

  return {
    run,
    reset,
    progress,
    isPending: prove.isPending || inFlight.current,
  };
}
