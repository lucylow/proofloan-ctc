export function sanitizeTxHash(value:string){ return value.trim().toLowerCase(); }
export function looksLikeTxHash(value:string){ return /^0x[a-f0-9]{64}$/.test(sanitizeTxHash(value)); }
