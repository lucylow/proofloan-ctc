import type { RpcEndpoint, RpcRole, RpcScheme } from './types';
import { OperatorError } from './errors';

export type { RpcEndpoint, RpcRole, RpcScheme };

export type RpcProbe = { url: string; role: RpcRole; healthy: boolean; latencyMs: number; supportsHistoricalBlocks: boolean; error?: string };

export function websocketScheme(url: string): RpcScheme | undefined {
  if (url.startsWith('wss://')) return 'wss';
  if (url.startsWith('ws://')) return 'ws';
  return undefined;
}

export function endpointFromUrl(role: RpcRole, url: string, extras: Partial<Omit<RpcEndpoint, 'role' | 'url' | 'scheme'>> = {}): RpcEndpoint | undefined {
  const scheme = websocketScheme(url);
  if (!scheme) return undefined;
  return {
    role,
    url,
    scheme,
    selfHosted: extras.selfHosted ?? true,
    healthy: extras.healthy ?? true,
    supportsHistoricalBlocks: extras.supportsHistoricalBlocks ?? role === 'ethereum',
    maxConcurrency: extras.maxConcurrency ?? (role === 'ethereum' ? 20 : 8),
    latencyMs: extras.latencyMs,
    lastCheckedAt: extras.lastCheckedAt,
    error: extras.error,
  };
}

export class OperatorRpcManager {
  private endpoints = new Map<RpcRole, RpcEndpoint[]>();
  private active = new Map<RpcRole, number>();

  constructor(initial: RpcEndpoint[] = []) { for (const endpoint of initial) this.add(endpoint); }
  add(endpoint: RpcEndpoint): void { const list = this.endpoints.get(endpoint.role) ?? []; list.push({ ...endpoint }); this.endpoints.set(endpoint.role, dedupe(list)); if (!this.active.has(endpoint.role)) this.active.set(endpoint.role, 0); }
  list(role?: RpcRole): RpcEndpoint[] { const all = [...this.endpoints.values()].flat().map(x => ({ ...x })); return role ? all.filter(x => x.role === role) : all; }
  choose(role: RpcRole): RpcEndpoint {
    const list = this.list(role);
    if (!list.length) throw new OperatorError("RPC", `No RPC endpoints configured for ${role}.`);
    const start = this.active.get(role) ?? 0;
    for (let offset = 0; offset < list.length; offset++) {
      const idx = (start + offset) % list.length;
      const candidate = list[idx];
      if (candidate && candidate.healthy !== false) {
        this.active.set(role, (idx + 1) % list.length);
        return candidate;
      }
    }
    throw new OperatorError("RPC", `All ${role} RPC endpoints are unhealthy.`, true);
  }
  tryChoose(role: RpcRole): RpcEndpoint | undefined { try { return this.choose(role); } catch { return undefined; } }
  recordProbe(probe: RpcProbe): void { const list = this.endpoints.get(probe.role) ?? []; this.endpoints.set(probe.role, list.map(x => x.url === probe.url ? { ...x, healthy: probe.healthy, latencyMs: probe.latencyMs, supportsHistoricalBlocks: probe.supportsHistoricalBlocks, lastCheckedAt: new Date().toISOString(), error: probe.error } : x)); }
  markUnhealthy(role: RpcRole, url: string, error: string): void { const list = this.endpoints.get(role) ?? []; this.endpoints.set(role, list.map(x => x.url === url ? { ...x, healthy:false, error, lastCheckedAt:new Date().toISOString() } : x)); }
  healthyCount(role: RpcRole): number { return this.list(role).filter(x => x.healthy !== false).length; }
}

function dedupe(items: RpcEndpoint[]): RpcEndpoint[] { const seen = new Set<string>(); return items.filter(item => !seen.has(item.url) && (seen.add(item.url), true)); }