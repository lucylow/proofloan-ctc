import type { AttestorProfile } from "@shared/attestors";
import { buildHealth } from "./health";
import { rankAttestors } from "./reputation";

export type AttestorDiagnostics = {
  generatedAt: string;
  health: ReturnType<typeof buildHealth>[];
  ranking: ReturnType<typeof rankAttestors>;
  totalStakeAtomic: string;
  totalWeightBps: number;
};

export function diagnostics(profiles: AttestorProfile[]): AttestorDiagnostics {
  const health = profiles.map(p => buildHealth(p));
  return {
    generatedAt: new Date().toISOString(),
    health,
    ranking: rankAttestors(profiles),
    totalStakeAtomic: profiles.reduce((sum, p) => sum + BigInt(p.stakeAtomic), 0n).toString(),
    totalWeightBps: profiles.reduce((sum, p) => sum + p.weightBps, 0),
  };
}
