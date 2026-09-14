import { useEffect, useRef } from "react";

export function useRouteReset(path: string, reset: () => void) {
  const previous = useRef(path);

  useEffect(() => {
    if (previous.current !== path) {
      previous.current = path;
      reset();
    }
  }, [path, reset]);
}
