import { AttestcoinError } from "../attestcoin/errors";

export type ProofDeadline = {
  startedAtMs: number;
  timeoutMs: number;
  deadlineAtMs: number;
  deadlineAt: string;
};

export function createProofDeadline(
  timeoutMs: number,
  nowMs = Date.now(),
): ProofDeadline {
  const deadlineAtMs = nowMs + timeoutMs;
  return {
    startedAtMs: nowMs,
    timeoutMs,
    deadlineAtMs,
    deadlineAt: new Date(deadlineAtMs).toISOString(),
  };
}

export function assertDeadlineOpen(
  deadline: Pick<ProofDeadline, "deadlineAtMs">,
  nowMs = Date.now(),
  requestId?: string,
) {
  if (nowMs > deadline.deadlineAtMs) {
    throw new AttestcoinError(
      "TIMEOUT",
      "Attestcoin proof request exceeded its deadline.",
      { retriable: true, requestId },
    );
  }
}

export function remainingDeadlineMs(
  deadline: Pick<ProofDeadline, "deadlineAtMs">,
  nowMs = Date.now(),
) {
  return Math.max(0, deadline.deadlineAtMs - nowMs);
}
