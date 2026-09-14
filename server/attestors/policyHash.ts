import { sha256Hex } from "./hash";
import type { AttestorPolicy } from "./policy";
export function policyHash(policy: AttestorPolicy): string { return sha256Hex({ requiredQuorumBps: policy.requiredQuorumBps, minimumAttestors: policy.minimumAttestors, minimumStakeAtomic: policy.minimumStakeAtomic.toString(), maximumObservedAgeSeconds: policy.maximumObservedAgeSeconds, maximumFaultRateBps: policy.maximumFaultRateBps, allowProbationForQuorum: policy.allowProbationForQuorum }); }
