export type RetryPolicy = { maxAttempts: number; initialDelayMs: number; maxDelayMs: number; multiplier: number };
export const defaultRetryPolicy: RetryPolicy = { maxAttempts: 5, initialDelayMs: 250, maxDelayMs: 5000, multiplier: 2 };

export function retryDelay(attempt: number, policy = defaultRetryPolicy): number {
  const n = Math.max(0, Math.floor(attempt));
  return Math.min(policy.maxDelayMs, Math.round(policy.initialDelayMs * policy.multiplier ** n));
}

export async function withRetry<T>(operation: () => Promise<T>, policy = defaultRetryPolicy): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < policy.maxAttempts; attempt += 1) {
    try { return await operation(); } catch (error) { last = error; if (attempt + 1 < policy.maxAttempts) await new Promise(resolve => setTimeout(resolve, retryDelay(attempt, policy))); }
  }
  throw last instanceof Error ? last : new Error("Attestor operation failed after retries.");
}
