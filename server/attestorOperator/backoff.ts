import { isOperatorError } from "./errors";

export function operatorRetryDelay(attempt: number, base = 500, max = 30_000, jitter = 0.2, random = Math.random): number {
  const exp = Math.min(max, base * Math.pow(2, Math.max(0, attempt - 1)));
  const delta = exp * jitter;
  return Math.round(exp - delta + random() * 2 * delta);
}

export function isRetryableOperatorError(error: unknown): boolean {
  if (isOperatorError(error)) return error.retriable;
  const message = error instanceof Error ? error.message : String(error);
  return /timeout|temporar|429|unavailable|connection|network|busy|election/i.test(message);
}
