export type ClientEnvironment = {
  mode: "development" | "test" | "production" | "unknown";
  isSecureContext: boolean;
  hasCrypto: boolean;
  hasStorage: boolean;
  hasFetch: boolean;
};

export function readClientEnvironment(): ClientEnvironment {
  if (typeof window === "undefined") {
    return { mode: "unknown", isSecureContext: false, hasCrypto: false, hasStorage: false, hasFetch: false };
  }

  let hasStorage = false;
  try {
    hasStorage = Boolean(window.localStorage && window.sessionStorage);
  } catch {
    hasStorage = false;
  }

  const rawMode = typeof import.meta.env.MODE === "string" ? import.meta.env.MODE : "unknown";
  const mode = (["development", "test", "production"] as const).includes(rawMode as never)
    ? rawMode as ClientEnvironment["mode"]
    : "unknown";

  return {
    mode,
    isSecureContext: window.isSecureContext,
    hasCrypto: Boolean(window.crypto),
    hasStorage,
    hasFetch: typeof window.fetch === "function",
  };
}
