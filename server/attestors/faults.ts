import { randomUUID } from "node:crypto";
import type { AttestorFault } from "@shared/attestors";
import { sha256Hex } from "./hash";

export class FaultBook {
  private readonly faults = new Map<string, AttestorFault>();

  propose(input: Omit<AttestorFault, "faultId" | "detectedAt" | "evidenceDigest"> & { evidence: unknown }): AttestorFault {
    const fault: AttestorFault = {
      faultId: `fault_${randomUUID().replaceAll("-", "")}`,
      operatorId: input.operatorId,
      sourceChain: input.sourceChain,
      category: input.category,
      severity: input.severity,
      evidenceDigest: sha256Hex(input.evidence),
      detectedAt: new Date().toISOString(),
    };
    this.faults.set(fault.faultId, fault);
    return structuredClone(fault);
  }

  confirm(faultId: string, slashBps: number): AttestorFault {
    const fault = this.faults.get(faultId);
    if (!fault) throw new Error(`Unknown fault ${faultId}.`);
    if (!Number.isInteger(slashBps) || slashBps < 0 || slashBps > 10_000) throw new Error("Invalid slash bps.");
    fault.confirmedAt = new Date().toISOString();
    fault.slashBps = slashBps;
    return structuredClone(fault);
  }

  list(): AttestorFault[] { return [...this.faults.values()].map(x => structuredClone(x)); }
  pending(): AttestorFault[] { return this.list().filter(x => !x.confirmedAt); }
  forOperator(operatorId: string): AttestorFault[] { return this.list().filter(x => x.operatorId === operatorId); }
}
