import type { OperatorAccount } from './types';

export class AccountSeparation {
  validate(attestor: OperatorAccount, stash: OperatorAccount): string[] {
    const errors: string[] = [];
    if (attestor.role !== 'attestor') errors.push('Attestor account must use role attestor.');
    if (stash.role !== 'stash') errors.push('Stash account must use role stash.');
    if (attestor.address === stash.address) errors.push('Attestor and stash addresses must be different.');
    if (attestor.keyType !== 'sr25519' || stash.keyType !== 'sr25519') errors.push('Both operator accounts must use sr25519.');
    if (!attestor.secretConfigured) errors.push('Attestor secret is not configured.');
    if (stash.secretConfigured) errors.push('Stash secret should remain off the Attestor host in production custody.');
    if (attestor.custody === 'cold') errors.push('Attestor account cannot be cold-only because the daemon needs a hot signing key.');
    if (stash.custody === 'hot') errors.push('Stash account should not be hot custody.');
    return errors;
  }
}