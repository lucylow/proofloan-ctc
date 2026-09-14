import { normalizeAppError } from "./appError";
import type { NormalizedAppError } from "./types";

export type RecoveryAction = {
  id: string;
  label: string;
  run: () => void | Promise<void>;
};

export type RecoverySnapshot = {
  error: NormalizedAppError;
  actions: RecoveryAction[];
};

export function createRecoverySnapshot(
  error: unknown,
  actions: RecoveryAction[],
): RecoverySnapshot {
  return {
    error: normalizeAppError(error),
    actions,
  };
}
