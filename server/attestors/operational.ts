import type { AtcOperator } from "@shared/atc";
import type { AttestorEnvironment, AttestorServiceSnapshot } from "@shared/attestors";
import { resolveOfficialEnvironment } from "../multichain/environment-v2/selection";
import { attestorError } from "./errors";
import type { AttestorService } from "./service";

export function currentAttestorEnvironment(value?: string): AttestorEnvironment {
  return resolveOfficialEnvironment({ explicit: value }).environment;
}

export function snapshotIsOperational(snapshot: AttestorServiceSnapshot, minimumAttestors: number): boolean {
  return (
    snapshot.activeAttestors >= minimumAttestors &&
    snapshot.healthyAttestors >= minimumAttestors &&
    snapshot.totalWeightBps >= snapshot.requiredQuorumBps
  );
}

export function assertOperationalAttestorSet(
  service: AttestorService,
  environment?: string,
): AttestorServiceSnapshot {
  const resolved = currentAttestorEnvironment(environment);
  const snapshot = service.snapshot(resolved);
  if (!snapshotIsOperational(snapshot, service.policy.minimumAttestors)) {
    throw attestorError(
      "ATTESTOR_SET_UNAVAILABLE",
      "ATC-paid actions require an operational Attestor set.",
      { snapshot },
    );
  }
  return snapshot;
}

export function attestorsAsAtcOperators(service: AttestorService, environment?: string): AtcOperator[] {
  return service.registry.active(currentAttestorEnvironment(environment)).map(profile => ({
    operatorId: profile.operatorId,
    name: profile.operatorId,
    weight: profile.weightBps,
    address: profile.payoutAddress,
  }));
}
