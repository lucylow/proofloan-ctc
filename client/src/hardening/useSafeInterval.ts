import { useEffect, useRef } from "react";

export function useSafeInterval(callback: () => void, delayMs: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delayMs === null) return undefined;
    const id = window.setInterval(() => callbackRef.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
