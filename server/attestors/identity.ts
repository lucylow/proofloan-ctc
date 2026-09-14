import { sha256Hex } from "./hash";
import type { AttestorIdentity, AttestorProfile } from "@shared/attestors";

export function identityDigest(identity: AttestorIdentity): string { return sha256Hex(identity); }
export function profileIdentity(profile: AttestorProfile): AttestorIdentity { return { operatorId: profile.operatorId, payoutAddress: profile.payoutAddress, signingAddress: profile.signingAddress, blsPublicKey: profile.blsPublicKey, environment: profile.environment, chains: [...profile.chains] }; }
