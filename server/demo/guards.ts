import { DemoError } from "./errors";
import { loadDemoConfig } from "./config";

export function demoLabel(mode: "live" | "demo"): string {
  try {
    const config = loadDemoConfig();
    if (mode === "demo" && config.exposeMockLabels) return "DEMO DATA — synthetic / not live proof";
    return mode === "live" ? "LIVE DATA" : "PREVIEW DATA";
  } catch {
    return mode === "demo" ? "DEMO DATA — synthetic / not live proof" : "LIVE DATA";
  }
}

export function assertLiveClaimsAllowed(mode: "live" | "demo", claim: string): void {
  if (mode === "demo") {
    throw new DemoError("LIVE_CLAIM", `Demo data cannot be represented as a live Attestcoin claim: ${claim}`);
  }
}

export function redactMockSecrets(value: string): string {
  if (typeof value !== "string" || value.length === 0) return "";
  return value.replace(/(mnemonic|seed|secret|privateKey)=([^&\s]+)/gi, "$1=[redacted]");
}
