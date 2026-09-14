import { z } from "zod";
import { DemoError } from "./errors";
import { DEMO_PROFILE_IDS, type DemoProfileId } from "./types";

const boolFromEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const numberFromEnv = (value: string | undefined, fallback: number, bounds: { min: number; max: number }): number => {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
};

export const demoConfigSchema = z.object({
  enabled: z.boolean(),
  allowLiveFailureFallback: z.boolean(),
  exposeMockLabels: z.boolean(),
  deterministic: z.boolean(),
  defaultProfile: z.enum(DEMO_PROFILE_IDS).default("strong-borrower"),
  maxProfiles: z.number().int().positive().max(100),
  artificialLatencyMs: z.number().int().min(0).max(5_000),
});

export type DemoConfig = z.infer<typeof demoConfigSchema>;

const DISABLED_CONFIG: DemoConfig = {
  enabled: false,
  allowLiveFailureFallback: false,
  exposeMockLabels: true,
  deterministic: true,
  defaultProfile: "strong-borrower",
  maxProfiles: 50,
  artificialLatencyMs: 0,
};

export function loadDemoConfig(env: NodeJS.ProcessEnv = process.env): DemoConfig {
  try {
    const requestedProfile = env.PROOFLOAN_DEMO_PROFILE || "strong-borrower";
    const defaultProfile = (DEMO_PROFILE_IDS as readonly string[]).includes(requestedProfile)
      ? (requestedProfile as DemoProfileId)
      : "strong-borrower";
    const parsed = demoConfigSchema.safeParse({
      enabled: boolFromEnv(env.PROOFLOAN_DEMO_MODE, false),
      allowLiveFailureFallback: boolFromEnv(env.PROOFLOAN_DEMO_FALLBACK, true),
      exposeMockLabels: boolFromEnv(env.PROOFLOAN_DEMO_LABELS, true),
      deterministic: boolFromEnv(env.PROOFLOAN_DEMO_DETERMINISTIC, true),
      defaultProfile,
      maxProfiles: numberFromEnv(env.PROOFLOAN_DEMO_MAX_PROFILES, 50, { min: 1, max: 100 }),
      artificialLatencyMs: numberFromEnv(env.PROOFLOAN_DEMO_LATENCY_MS, 0, { min: 0, max: 5_000 }),
    });
    return parsed.success ? parsed.data : DISABLED_CONFIG;
  } catch {
    return DISABLED_CONFIG;
  }
}

export function isDemoMode(config: DemoConfig = loadDemoConfig()): boolean {
  return config.enabled;
}

export function assertDemoEnabled(config: DemoConfig = loadDemoConfig()): void {
  if (!config.enabled) throw new DemoError("DISABLED", "ProofLoan demo mode is disabled.");
}
