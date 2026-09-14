import { backoffDelay, type BackoffPolicy } from "./backoff";
import { classifyError } from "./errors";

export async function retry<T>(fn: (attempt: number) => Promise<T>, options: { maxAttempts: number; backoff: BackoffPolicy; sleep?: (ms:number)=>Promise<void> }): Promise<T> {
  const sleep = options.sleep ?? ((ms) => new Promise<void>(r => setTimeout(r, ms)));
  let last: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try { return await fn(attempt); }
    catch (error) {
      const normalized = classifyError(error);
      last = normalized;
      if (!normalized.retryable || attempt === options.maxAttempts) throw normalized;
      await sleep(backoffDelay(attempt, options.backoff, normalized.retryClass));
    }
  }
  throw last;
}
