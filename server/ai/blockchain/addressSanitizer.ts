export function sanitizeAddress(value:string){ return value.trim().toLowerCase(); }
export function looksLikeEvmAddress(value:string){ return /^0x[a-f0-9]{40}$/.test(sanitizeAddress(value)); }
