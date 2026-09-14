import type { OperatorEnvironment } from './types';
export type StorageQuery = { pallet:'attestation'|'supportedChains'; method:string; args:string[]; description:string };

export function authorizedAttestorQuery(environment:OperatorEnvironment, chainKey:number,address:string):StorageQuery{return {pallet:'attestation',method:'authorizedAttestors',args:[String(chainKey),address],description:`Check whether ${address} is authorized on ${environment}.`};}
export function attestorQuery(chainKey:number,address:string):StorageQuery{return {pallet:'attestation',method:'attestors',args:[String(chainKey),address],description:'Read the operator registration and lifecycle state.'};}
export function activeAttestorsQuery(chainKey:number):StorageQuery{return {pallet:'attestation',method:'activeAttestors',args:[String(chainKey)],description:'Read the currently elected active Attestors.'};}
export function supportedChainsQuery():StorageQuery{return {pallet:'supportedChains',method:'supportedChains',args:[],description:'Resolve registered source-chain IDs to current chain keys.'};}

export function eventNames(){return ['attestation.AuthorizedAttestorAdded','attestation.RegisteredAttestor','attestation.AttestorStatusChanged','attestation.AttestorElected','attestation.AttestorChilled','attestation.AttestorUnregistered','attestation.Withdrawn'];}