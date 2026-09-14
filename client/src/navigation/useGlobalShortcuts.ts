import { useEffect } from "react";
import { useLocation } from "wouter";

import { KEYBOARD_SHORTCUTS } from "./catalog";
import { navigateSafely } from "@/hardening/safeNavigation";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function useGlobalShortcuts(
  onSearch: () => void,
  searchEnabled = true,
) {
  const [, navigate] = useLocation();

  useEffect(() => {
    let awaitingGo = false;
    let goTimer = 0;

    const handler = (event: KeyboardEvent) => {
      if (
        searchEnabled &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        onSearch();
        return;
      }

      if (isTypingTarget(event.target)) {
        awaitingGo = false;
        return;
      }

      if (searchEnabled && event.key === "/") {
        event.preventDefault();
        onSearch();
        return;
      }

      if (
        event.key === "g" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        awaitingGo = true;
        window.clearTimeout(goTimer);
        goTimer = window.setTimeout(() => {
          awaitingGo = false;
        }, 800);
        return;
      }

      if (awaitingGo) {
        awaitingGo = false;
        const destination =
          KEYBOARD_SHORTCUTS[
            event.key.toLowerCase() as keyof typeof KEYBOARD_SHORTCUTS
          ];
        if (destination) {
          event.preventDefault();
          navigateSafely(navigate, destination);
        }
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.clearTimeout(goTimer);
      window.removeEventListener("keydown", handler);
    };
  }, [navigate, onSearch, searchEnabled]);
}
