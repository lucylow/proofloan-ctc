export type RpcHealth = { endpoint: string; healthy: boolean; latencyMs: number; checkedAt: string; error?: string };

export async function checkAttestorRpc(endpoint: string, request: () => Promise<unknown>): Promise<RpcHealth> { const started = Date.now(); try { await request(); return { endpoint, healthy: true, latencyMs: Date.now() - started, checkedAt: new Date().toISOString() }; } catch (error) { return { endpoint, healthy: false, latencyMs: Date.now() - started, checkedAt: new Date().toISOString(), error: error instanceof Error ? error.message.slice(0, 200) : "request failed" }; } }
