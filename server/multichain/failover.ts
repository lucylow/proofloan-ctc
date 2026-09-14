export type FailoverAttempt<T> = {
  index: number;
  target: string;
  ok: boolean;
  value?: T;
  error?: unknown;
  latencyMs: number;
};

export type FailoverResult<T> = {
  value: T;
  target: string;
  attempts: FailoverAttempt<T>[];
  failedOver: boolean;
};

export class FailoverExhaustedError extends Error {
  readonly attempts: FailoverAttempt<unknown>[];

  constructor(label: string, attempts: FailoverAttempt<unknown>[]) {
    const last = attempts.at(-1)?.error;
    const detail = last instanceof Error ? last.message : "all targets failed";
    super(`${label} failover exhausted: ${detail}`);
    this.name = "FailoverExhaustedError";
    this.attempts = attempts;
  }
}

export async function withFailover<T>(
  targets: readonly string[],
  operation: (target: string, index: number) => Promise<T>,
  options: {
    label?: string;
    onAttempt?: (attempt: FailoverAttempt<T>) => void;
  } = {},
): Promise<FailoverResult<T>> {
  if (targets.length === 0) {
    throw new FailoverExhaustedError(options.label ?? "provider", []);
  }

  const attempts: FailoverAttempt<T>[] = [];

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index]!;
    const started = Date.now();
    try {
      const value = await operation(target, index);
      const attempt: FailoverAttempt<T> = {
        index,
        target,
        ok: true,
        value,
        latencyMs: Date.now() - started,
      };
      attempts.push(attempt);
      options.onAttempt?.(attempt);
      return {
        value,
        target,
        attempts,
        failedOver: index > 0,
      };
    } catch (error) {
      const attempt: FailoverAttempt<T> = {
        index,
        target,
        ok: false,
        error,
        latencyMs: Date.now() - started,
      };
      attempts.push(attempt);
      options.onAttempt?.(attempt);
    }
  }

  throw new FailoverExhaustedError(options.label ?? "provider", attempts);
}

export function firstHealthyTarget<T>(attempts: FailoverAttempt<T>[]) {
  return attempts.find(attempt => attempt.ok)?.target;
}
