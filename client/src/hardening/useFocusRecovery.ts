import { useCallback, useEffect, useRef } from "react";

export function useFocusRecovery() {
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const listener = () => {
      if (document.activeElement instanceof HTMLElement) {
        lastFocused.current = document.activeElement;
      }
    };

    document.addEventListener("focusin", listener);
    return () => document.removeEventListener("focusin", listener);
  }, []);

  return useCallback(() => {
    window.setTimeout(() => {
      lastFocused.current?.focus({ preventScroll: true });
    }, 0);
  }, []);
}
