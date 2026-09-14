export type FeatureFlags = {
  hardenedNavigation: boolean;
  demoMode: boolean;
  walletGuard: boolean;
  recoveryUI: boolean;
  aggressiveRetries: boolean;
};

const defaults: FeatureFlags = {
  hardenedNavigation: true,
  demoMode: true,
  walletGuard: true,
  recoveryUI: true,
  aggressiveRetries: false,
};

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem("proofloan.featureFlags");
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}
