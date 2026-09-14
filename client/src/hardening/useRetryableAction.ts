import { useCallback, useRef, useState } from "react";
import { withRetry } from "./network";
import { normalizeAppError } from "./appError";

export function useRetryableAction<T>(
  operation: () => Promise<T>,
  options?: Parameters<typeof withRetry>[1],
) {
  const running = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ReturnType<typeof normalizeAppError> | null>(null);

  const run = useCallback(async () => {
    if (running.current) return undefined;
    running.current = true;
    setPending(true);
    setError(null);

    try {
      const result = await withRetry(() => operation(), options);
      if (!result.ok) {
        setError(result.error);
        return undefined;
      }
      return result.value;
    } catch (cause) {
      const normalized = normalizeAppError(cause);
      setError(normalized);
      return undefined;
    } finally {
      running.current = false;
      setPending(false);
    }
  }, [operation, options]);

  return { run, pending, error };
}
