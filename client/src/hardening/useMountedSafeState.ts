import { useCallback, useEffect, useRef, useState } from "react";

export function useMountedSafeState<T>(initialValue: T) {
  const mounted = useRef(true);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const safeSetValue = useCallback((next: T | ((previous: T) => T)) => {
    if (!mounted.current) return;
    setValue(next);
  }, []);

  return [value, safeSetValue, mounted] as const;
}
