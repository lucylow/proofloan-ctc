import { useCallback, useRef } from "react";

export function useLatestRequestGuard() {
  const requestId = useRef(0);

  const next = useCallback(() => {
    requestId.current += 1;
    return requestId.current;
  }, []);

  const isCurrent = useCallback((id: number) => {
    return id === requestId.current;
  }, []);

  return { next, isCurrent };
}

export class StaleRequestError extends Error {
  constructor() {
    super("Request result is stale");
    this.name = "StaleRequestError";
  }
}
