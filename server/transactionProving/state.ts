export type ProofLifecycle =
  | "queued"
  | "awaiting_attestation"
  | "building"
  | "ready"
  | "submitted"
  | "verified"
  | "failed";

const ALLOWED: Record<ProofLifecycle, ProofLifecycle[]> = {
  queued: ["queued", "awaiting_attestation", "failed"],
  awaiting_attestation: ["awaiting_attestation", "building", "failed"],
  building: ["building", "ready", "failed"],
  ready: ["ready", "submitted", "failed"],
  submitted: ["submitted", "verified", "failed"],
  verified: ["verified", "failed"],
  failed: ["failed"],
};

export function canTransition(from: ProofLifecycle, to: ProofLifecycle): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}
