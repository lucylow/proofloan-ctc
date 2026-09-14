import type { WorkerPhase } from "./types";

const score: Record<WorkerPhase, number> = {
  submitted: 0,
  "proof-ready": 1,
  matured: 2,
  discovered: 3,
  created: 4,
  "proof-building": 1,
  submitting: 0,
  confirmed: 9,
  "dead-letter": 9,
  cancelled: 9,
};

export function priorityForPhase(phase: WorkerPhase) {
  return score[phase] ?? 5;
}

export function compareJobs(
  a: { phase: WorkerPhase; createdAt: string },
  b: { phase: WorkerPhase; createdAt: string },
) {
  return (
    priorityForPhase(a.phase) - priorityForPhase(b.phase) ||
    Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}
