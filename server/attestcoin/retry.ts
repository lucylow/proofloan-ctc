import { AttestcoinError } from "./errors";

export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
};

export function backoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  jitterRatio: number,
): number {
  const exponential = Math.min(
    maxDelayMs,
    baseDelayMs * 2 ** Math.max(0, attempt - 1),
  );
  const jitter = exponential * jitterRatio * Math.random();
  return Math.round(exponential + jitter);
}

export async function retryAttestcoin<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;

      const normalized =
        error instanceof AttestcoinError
          ? error
          : undefined;

      const allowed =
        attempt <= options.retries &&
        (options.shouldRetry
          ? options.shouldRetry(error, attempt)
          : normalized?.retriable ?? true);

      if (!allowed) throw error;

      const delayMs = backoffDelay(
        attempt,
        options.baseDelayMs,
        options.maxDelayMs,
        options.jitterRatio,
      );

      options.onRetry?.(error, attempt, delayMs);

      await new Promise(resolve =>
        setTimeout(resolve, delayMs),
      );
    }
  }
}
