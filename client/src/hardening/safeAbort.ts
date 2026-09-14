export function createAbortController() {
  if (typeof AbortController === "undefined") return undefined;
  return new AbortController();
}

export function abortSilently(controller: AbortController | undefined) {
  try {
    controller?.abort();
  } catch {
    // cleanup must never throw
  }
}
