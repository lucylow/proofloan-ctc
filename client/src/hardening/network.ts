import { ProofLoanAppError, normalizeAppError } from "./appError";
import type { Result, RetryPolicy } from "./types";

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 350,
  maxDelayMs: 2500,
  jitterRatio: 0.15,
};

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export function computeBackoff(attempt: number, policy = DEFAULT_RETRY_POLICY): number {
  const exponential = Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs * 2 ** Math.max(0, attempt - 1),
  );
  const jitter = exponential * policy.jitterRatio;
  return Math.round(exponential - jitter + Math.random() * jitter * 2);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = globalThis.setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        globalThis.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: Partial<RetryPolicy> = {},
  signal?: AbortSignal,
): Promise<Result<T>> {
  const policy = { ...DEFAULT_RETRY_POLICY, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      return {
        ok: false,
        error: normalizeAppError(
          new ProofLoanAppError({
            code: "REQUEST_CANCELLED",
            message: "Request cancelled",
            source: "network",
          }),
          { source: "network" },
        ),
      };
    }

    try {
      const value = await operation(attempt);
      return { ok: true, value };
    } catch (error) {
      lastError = error;
      const normalized = normalizeAppError(error, {
        source: "network",
        retryable: true,
      });

      if (!normalized.retryable || attempt >= policy.maxAttempts) {
        return { ok: false, error: normalized };
      }

      try {
        await sleep(computeBackoff(attempt, policy), signal);
      } catch (sleepError) {
        return {
          ok: false,
          error: normalizeAppError(sleepError, {
            source: "network",
          }),
        };
      }
    }
  }

  return {
    ok: false,
    error: normalizeAppError(lastError, {
      source: "network",
      retryable: true,
    }),
  };
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  if (!isOnline()) {
    throw new ProofLoanAppError({
      code: "NETWORK_OFFLINE",
      message: "Browser reports offline",
      source: "network",
      retryable: true,
    });
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  if (init.signal) {
    init.signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true },
    );
  }

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const code = response.status === 429
        ? "RATE_LIMITED"
        : response.status >= 500
          ? "SERVICE_UNAVAILABLE"
          : "NETWORK_FAILED";

      throw new ProofLoanAppError({
        code,
        message: `HTTP ${response.status}`,
        source: "network",
        retryable: response.status === 429 || response.status >= 500,
        metadata: { status: response.status },
      });
    }

    return response;
  } catch (error) {
    if (isAbortError(error)) {
      throw new ProofLoanAppError({
        code: "NETWORK_TIMEOUT",
        message: "Request timed out",
        source: "network",
        retryable: true,
      });
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
