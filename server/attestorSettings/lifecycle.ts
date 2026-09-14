import { getAttestorSettings } from "./registry";
import type { AttestorNetwork } from "./types";

export type OnChainAttestorStatus = "None" | "Idle" | "Waiting" | "Active" | "Leaving";
export type LifecycleAction = "authorize" | "register" | "attest" | "wait-election" | "chill" | "unregister" | "withdraw";

export function nextActions(
  network: AttestorNetwork,
  status: OnChainAttestorStatus,
  authorized: boolean,
): LifecycleAction[] {
  const settings = getAttestorSettings(network);
  if (!authorized && settings.electionMode === "AuthorizedOnly") return ["authorize"];
  if (status === "None") return ["register"];
  if (status === "Idle") return ["attest", "wait-election"];
  if (status === "Waiting") return ["wait-election"];
  if (status === "Active") return ["chill"];
  if (status === "Leaving") return ["wait-election", "unregister"];
  return [];
}
