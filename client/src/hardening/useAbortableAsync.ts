import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeAppError } from "./appError";
import type { AsyncStatus } from "./types";

export function useAbortableAsync<T, Args extends unknown[]>(
  operation: (signal: AbortSignal, ...args: Args) => Promise<T>,
) {
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<ReturnType<typeof normalizeAppError> | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(async (...args: Args): Promise<T | undefined> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus("pending");
    setError(null);

    try {
      const value = await operation(controller.signal, ...args);
      if (!mountedRef.current || controller.signal.aborted) return undefined;
      setData(value);
      setStatus("success");
      return value;
    } catch (cause) {
      if (!mountedRef.current) return undefined;
      if (controller.signal.aborted) {
        setStatus("cancelled");
        return undefined;
      }
      setError(normalizeAppError(cause));
      setStatus("error");
      return undefined;
    }
  }, [operation]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { run, cancel, status, data, error };
}
