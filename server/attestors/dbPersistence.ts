import { eq } from "drizzle-orm";
import type { AttestationCertificate, AttestorFault, AttestorRewardAllocation } from "@shared/attestors";
import {
  attestorCertificates,
  attestorFaults,
  attestorRewardLedger,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { MemoryAttestorPersistence, type AttestorPersistence } from "./persistence";

function asJson(value: unknown): string {
  return JSON.stringify(value);
}

function warnPersistenceFailure(label: string, error: unknown): void {
  console.warn(
    `[Attestors] ${label} persistence failed`,
    error instanceof Error ? error.message : error,
  );
}

async function withAttestorPersistence(
  label: string,
  work: (db: NonNullable<Awaited<ReturnType<typeof getDb>>>) => Promise<void>,
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await work(db);
  } catch (error) {
    warnPersistenceFailure(label, error);
  }
}

export class DurableAttestorPersistence implements AttestorPersistence {
  constructor(private readonly memory = new MemoryAttestorPersistence()) {}

  async saveCertificate(certificate: AttestationCertificate): Promise<void> {
    await this.memory.saveCertificate(certificate);
    await withAttestorPersistence("certificate", async db => {
      await db.insert(attestorCertificates).values({
        certificateId: certificate.certificateId,
        environment: certificate.environment,
        sourceChain: certificate.sourceChain,
        sourceBlock: certificate.sourceBlock,
        digest: certificate.digest,
        certificateJson: asJson(certificate),
        createdAt: new Date(certificate.createdAt),
      }).onDuplicateKeyUpdate({
        set: {
          digest: certificate.digest,
          certificateJson: asJson(certificate),
        },
      });
    });
  }

  async saveFault(fault: AttestorFault): Promise<void> {
    await this.memory.saveFault(fault);
    await withAttestorPersistence("fault", async db => {
      await db.insert(attestorFaults).values({
        faultId: fault.faultId,
        operatorId: fault.operatorId,
        sourceChain: fault.sourceChain,
        category: fault.category,
        severity: fault.severity,
        evidenceDigest: fault.evidenceDigest,
        slashBps: fault.slashBps,
        faultJson: asJson(fault),
        detectedAt: new Date(fault.detectedAt),
        confirmedAt: fault.confirmedAt ? new Date(fault.confirmedAt) : null,
      }).onDuplicateKeyUpdate({
        set: {
          slashBps: fault.slashBps,
          faultJson: asJson(fault),
          confirmedAt: fault.confirmedAt ? new Date(fault.confirmedAt) : null,
        },
      });
    });
  }

  async saveReward(reward: AttestorRewardAllocation): Promise<void> {
    await this.memory.saveReward(reward);
    const ledgerId = `${reward.feeId}:${reward.operatorId}:${reward.activity}`;
    await withAttestorPersistence("reward", async db => {
      await db.insert(attestorRewardLedger).values({
        ledgerId,
        feeId: reward.feeId,
        operatorId: reward.operatorId,
        activity: reward.activity,
        amountAtomic: reward.amountAtomic,
        status: reward.status,
        rewardJson: asJson(reward),
      }).onDuplicateKeyUpdate({
        set: {
          amountAtomic: reward.amountAtomic,
          status: reward.status,
          rewardJson: asJson(reward),
        },
      });
    });
  }

  listCertificates(sourceChain?: string) {
    return this.memory.listCertificates(sourceChain);
  }

  listFaults(operatorId?: string) {
    return this.memory.listFaults(operatorId);
  }

  listRewards(operatorId?: string) {
    return this.memory.listRewards(operatorId);
  }
}

export function createAttestorPersistence(): AttestorPersistence {
  return new DurableAttestorPersistence();
}

export async function loadPersistedCertificates(sourceChain?: string): Promise<AttestationCertificate[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const rows = sourceChain
      ? await db.select().from(attestorCertificates).where(eq(attestorCertificates.sourceChain, sourceChain))
      : await db.select().from(attestorCertificates);
    return rows.flatMap(row => {
      try {
        return [JSON.parse(row.certificateJson) as AttestationCertificate];
      } catch {
        return [];
      }
    });
  } catch (error) {
    warnPersistenceFailure("certificate load", error);
    return [];
  }
}
