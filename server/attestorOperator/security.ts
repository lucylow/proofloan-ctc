import { OperatorError } from './errors';

export type SecretExposureCheck = { ok:boolean; severity:'info'|'warning'|'error'; message:string };

export function inspectSecret(secret: string | undefined): SecretExposureCheck {
  if (!secret) return { ok:false,severity:'error',message:'Attestor secret is missing.' };
  const mnemonicLike = secret.trim().split(/\s+/).length >= 12;
  const hexLike = /^0x[0-9a-fA-F]{64}$/.test(secret.trim());
  if (!mnemonicLike && !hexLike) return { ok:false,severity:'error',message:'Attestor secret is neither a plausible mnemonic nor 32-byte hex seed.' };
  return { ok:true,severity:'info',message:'Attestor secret format is structurally valid; secret material is not logged or persisted by this module.' };
}

export function assertNoSecretInLog(message: string, secret?: string): void {
  if (secret && secret.length > 7 && message.includes(secret)) {
    throw new OperatorError("CONFIG", "Secret material detected in log output.");
  }
}
export function redactRpc(url: string): string { try { const u=new URL(url); if (u.username) u.username='***'; if (u.password) u.password='***'; for (const key of ['key','apiKey','apikey','token']) if (u.searchParams.has(key)) u.searchParams.set(key,'***'); return u.toString(); } catch { return url.replace(/([?&](?:key|apiKey|apikey|token)=)[^&]+/gi,'$1***'); } }
