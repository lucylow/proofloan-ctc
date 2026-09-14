import type { ProofEnvelope } from "./types";

export interface AscSubmission {
  requestId: string;
  chainKey: number;
  txHash: string;
  submittedAt: number;
  payloadHash: string;
}

export interface AscClient {
  submit(envelope: ProofEnvelope): Promise<{ txHash: string }>;
}

export class IdempotentSubmissionManager {
  private readonly submitted = new Map<string, AscSubmission>();

  constructor(private readonly client: AscClient) {}

  async submit(envelope: ProofEnvelope): Promise<AscSubmission> {
    const prior = this.submitted.get(envelope.fingerprint);
    if (prior) return prior;
    const result = await this.client.submit(envelope);
    const record: AscSubmission = {
      requestId: envelope.requestId,
      chainKey: envelope.target.chainKey,
      txHash: result.txHash,
      submittedAt: Date.now(),
      payloadHash: envelope.fingerprint,
    };
    this.submitted.set(envelope.fingerprint, record);
    return record;
  }

  reset(): void {
    this.submitted.clear();
  }
}

export class PreviewAscClient implements AscClient {
  async submit(envelope: ProofEnvelope): Promise<{ txHash: string }> {
    return { txHash: `0xpreview_${envelope.fingerprint.slice(0, 56)}` };
  }
}
