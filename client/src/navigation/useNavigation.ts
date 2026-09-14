import { useCallback } from "react";
import { useLocation } from "wouter";
import { navigateSafely } from "@/hardening/safeNavigation";

export function useNavigation() {
  const [, navigate] = useLocation();

  const go = useCallback(
    (path: string) => {
      navigateSafely(navigate, path);

      window.setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 0);
    },
    [navigate],
  );

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return {
    go,
    back,
  };
}
