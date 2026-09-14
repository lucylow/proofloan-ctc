import { useEffect, useRef } from "react";

export function useMountedRef() {
  const ref = useRef(true);

  useEffect(() => {
    return () => {
      ref.current = false;
    };
  }, []);

  return ref;
}
