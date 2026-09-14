import { environmentCapabilities } from "./capabilities";
import { environmentFingerprint } from "./fingerprint";
import { buildPublicAttestcoinManifest } from "./publicManifest";
import { validateOfficialEnvironment } from "./validation";

export function environmentDiagnostics(environment: string) {
  const errors = validateOfficialEnvironment(environment);
  const item = buildPublicAttestcoinManifest().find(entry => entry.id === environment);
  return {
    environment,
    valid: errors.length === 0,
    errors,
    fingerprint: errors.length === 0 ? environmentFingerprint(environment) : null,
    capabilities:
      errors.length === 0 ? environmentCapabilities(environment) : null,
    manifest: item ?? null,
  };
}

export function allEnvironmentDiagnostics() {
  return buildPublicAttestcoinManifest().map(entry =>
    environmentDiagnostics(entry.id),
  );
}
