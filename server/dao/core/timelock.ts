import { isGovernanceTimestamp } from "../errors";

export function timelockReady(eta: string, now = Date.now()): boolean {
  if (!Number.isFinite(now) || !isGovernanceTimestamp(eta)) return false;
  return Date.parse(eta) <= now;
}
