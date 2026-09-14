import { loadDemoConfig } from "./config";
import { listDemoProfiles } from "./profiles";
import { listExtendedCases } from "./extended/catalog";

const UNAVAILABLE_HEALTH = {
  enabled: false,
  allowLiveFailureFallback: false,
  deterministic: true,
  profileCount: 0,
  extendedCaseCount: 0,
  defaultProfile: "strong-borrower" as const,
  latencyMs: 0,
  warning: "Demo health is unavailable because configuration could not be loaded.",
};

export function demoHealth() {
  try {
    const config = loadDemoConfig();
    let extendedCaseCount = 0;
    try {
      extendedCaseCount = listExtendedCases().length;
    } catch {
      extendedCaseCount = 0;
    }
    return {
      enabled: config.enabled,
      allowLiveFailureFallback: config.allowLiveFailureFallback,
      deterministic: config.deterministic,
      profileCount: listDemoProfiles().length,
      extendedCaseCount,
      defaultProfile: config.defaultProfile,
      latencyMs: config.artificialLatencyMs,
      warning: config.enabled
        ? "Synthetic demo data may be used; no mock fact is a live proof."
        : "Demo mode disabled.",
    };
  } catch {
    return UNAVAILABLE_HEALTH;
  }
}
