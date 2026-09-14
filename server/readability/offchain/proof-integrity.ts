import {digestObject} from './hash';
export function proofFingerprint(proof:unknown){return digestObject(proof)}
export function assertProofFingerprint(proof:unknown,expected:string){if(proofFingerprint(proof)!==expected)throw new Error('proof fingerprint mismatch')}
