import { useEffect } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
) {
  useEffect(() => {
    window.addEventListener(event, handler as EventListener);
    return () => window.removeEventListener(event, handler as EventListener);
  }, [event, handler]);
}
