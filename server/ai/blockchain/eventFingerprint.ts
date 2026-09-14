import { createHash } from 'node:crypto';
export function eventFingerprint(input:Record<string,unknown>){ return createHash('sha256').update(JSON.stringify(input,Object.keys(input).sort())).digest('hex'); }
