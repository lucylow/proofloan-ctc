import { AttestorOperatorService } from './operatorService';
import { fromEnv } from './config';
import { endpointFromUrl, type RpcEndpoint } from './rpc';
import type { OperatorStatus } from './types';
import { getAttestorSettings } from '@shared/attestorSettings';
import { parseBoundedInteger } from './errors';

function parseOperatorStatus(value: string | undefined): OperatorStatus {
  if (value === 'idle' || value === 'waiting' || value === 'active' || value === 'leaving' || value === 'inactive' || value === 'unregistered') return value;
  return 'unregistered';
}

function configuredEndpoints(node = fromEnv()): RpcEndpoint[] {
  const endpoints: RpcEndpoint[] = [];
  const cc3 = node.cc3?.url ? endpointFromUrl('cc3', node.cc3.url) : undefined;
  const eth = node.eth?.url ? endpointFromUrl('ethereum', node.eth.url, { supportsHistoricalBlocks: true }) : undefined;
  if (cc3) endpoints.push(cc3);
  if (eth) endpoints.push(eth);
  return endpoints;
}

const environment = (process.env.ATTESTOR_ENVIRONMENT === 'cc3-mainnet' ? 'cc3-mainnet' : 'cc3-testnet') as 'cc3-testnet' | 'cc3-mainnet';
const chainKey = parseBoundedInteger(
  process.env.ATTESTOR_CHAIN_KEY,
  getAttestorSettings(environment).chainKey,
  { min: 1 },
);
const node = fromEnv();
const attestorAddress = process.env.ATTESTOR_ADDRESS ?? 'unknown';
const stashAddress = process.env.ATTESTOR_STASH_ADDRESS ?? 'unknown-stash';

const defaultOperatorState = {
  operatorId: process.env.ATTESTOR_NAME ?? 'proofloan-operator',
  environment,
  chainKey,
  node,
  attestor: { address: attestorAddress, role: 'attestor' as const, keyType: 'sr25519' as const, secretConfigured: Boolean(process.env.ATTESTOR_SECRET), custody: 'hot' as const, fundedBalanceAtomic: process.env.ATTESTOR_BALANCE_ATOMIC },
  stash: { address: stashAddress, role: 'stash' as const, keyType: 'sr25519' as const, secretConfigured: Boolean(process.env.ATTESTOR_STASH_SECRET), custody: 'cold' as const, fundedBalanceAtomic: process.env.ATTESTOR_STASH_BALANCE_ATOMIC },
  state: { operatorId: process.env.ATTESTOR_NAME ?? 'proofloan-operator', environment, chainKey, attestorAddress, stashAddress, authorized: process.env.ATTESTOR_AUTHORIZED === 'true', registered: process.env.ATTESTOR_REGISTERED === 'true', status: parseOperatorStatus(process.env.ATTESTOR_STATUS), elected: false, active: false },
};

export const attestorOperatorService = new AttestorOperatorService(defaultOperatorState, configuredEndpoints(node));
