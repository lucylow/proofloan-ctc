import type { AttestationCertificate } from "@shared/attestors";
export class AttestationCertificateCache {
  private readonly values = new Map<string, { certificate: AttestationCertificate; expiresAt: number }>();
  put(key: string, certificate: AttestationCertificate, ttlMs = 300_000): void { this.values.set(key, { certificate: structuredClone(certificate), expiresAt: Date.now() + ttlMs }); }
  get(key: string): AttestationCertificate | undefined { const entry = this.values.get(key); if (!entry) return undefined; if (entry.expiresAt <= Date.now()) { this.values.delete(key); return undefined; } return structuredClone(entry.certificate); }
  invalidate(key: string): boolean { return this.values.delete(key); }
}
