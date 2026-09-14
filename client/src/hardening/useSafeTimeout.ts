import { useEffect, useRef } from "react";

export function useSafeTimeout(callback: () => void, delayMs: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delayMs === null) return undefined;
    const id = window.setTimeout(() => callbackRef.current(), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);
}
