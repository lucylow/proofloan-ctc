import type { AttestorProfile } from "@shared/attestors";
export function environmentCompatible(profile: AttestorProfile, environment: "cc3-testnet" | "cc3-mainnet"): boolean { return profile.environment === environment; }
export function chainCompatible(profile: AttestorProfile, chain: string): boolean { return profile.chains.length === 0 || profile.chains.includes(chain); }
export function compatibleProfiles(profiles: AttestorProfile[], environment: AttestorProfile["environment"], chain?: string): AttestorProfile[] { return profiles.filter(p => environmentCompatible(p, environment) && (!chain || chainCompatible(p, chain))).map(p => ({ ...p })); }
