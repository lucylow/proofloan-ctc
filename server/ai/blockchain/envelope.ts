import { createHash } from 'node:crypto';
import type { BlockchainDecisionEnvelope } from './decisionEnvelope';
export function envelopeFingerprint(e:BlockchainDecisionEnvelope){ return createHash('sha256').update(JSON.stringify(e)).digest('hex'); }
