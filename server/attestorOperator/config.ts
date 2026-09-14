import type { OperatorConfigSource, OperatorEnvironment, OperatorNodeConfig } from './types';
import { z } from 'zod';
import { OperatorError } from './errors';

const schema = z.object({
  name: z.string().min(1),
  chainKey: z.number().int().positive(),
  secret: z.string(),
  publicAddress: z.string().min(1).optional(),
  logsPath: z.string().min(1),
  apiPort: z.number().int().min(1).max(65535),
  p2pPort: z.number().int().min(1).max(65535),
  noMdns: z.boolean(),
  bootNodes: z.array(z.string()),
  eth: z.object({ url: z.string() }),
  cc3: z.object({ url: z.string() }),
});

export type RawConfig = Partial<OperatorNodeConfig> & { environment?: OperatorEnvironment; secret?: string };

export function fromEnv(env: NodeJS.ProcessEnv = process.env): Partial<OperatorNodeConfig> {
  const chainKey = Number(env.ATTESTOR_CHAIN_KEY ?? NaN);
  const apiPort = Number(env.ATTESTOR_API_PORT ?? NaN);
  const p2pPort = Number(env.ATTESTOR_P2P_PORT ?? NaN);
  return stripUndefined({
    name: env.ATTESTOR_NAME,
    chainKey: Number.isInteger(chainKey) ? chainKey : undefined,
    secret: env.ATTESTOR_SECRET,
    publicAddress: env.ATTESTOR_PUBLIC_ADDRESS,
    logsPath: env.ATTESTOR_LOGS,
    apiPort: Number.isInteger(apiPort) ? apiPort : undefined,
    p2pPort: Number.isInteger(p2pPort) ? p2pPort : undefined,
    noMdns: parseBool(env.ATTESTOR_NO_MDNS),
    bootNodes: splitList(env.ATTESTOR_BOOT_NODES),
    eth: env.ATTESTOR_ETH_URL ? { url: env.ATTESTOR_ETH_URL } : undefined,
    cc3: env.ATTESTOR_CC3_URL ? { url: env.ATTESTOR_CC3_URL } : undefined,
  });
}

export function fromCli(argv = process.argv.slice(2)): Partial<OperatorNodeConfig> {
  const result: Record<string, string | boolean | number | string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg || !arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key === 'no-mdns') { result.noMdns = true; continue; }
    const value = argv[i + 1];
    if (value && !value.startsWith('--')) { i++; result[key] = value; }
  }
  return {
    ...(result.name ? { name: String(result.name) } : {}),
    ...(integerFrom(result['chain-key']) !== undefined ? { chainKey: integerFrom(result['chain-key']) } : {}),
    ...(result.secret ? { secret: String(result.secret) } : {}),
    ...(result['public-addr'] ? { publicAddress: String(result['public-addr']) } : {}),
    ...(result.logs ? { logsPath: String(result.logs) } : {}),
    ...(integerFrom(result['api-port']) !== undefined ? { apiPort: integerFrom(result['api-port']) } : {}),
    ...(integerFrom(result['p2p-port']) !== undefined ? { p2pPort: integerFrom(result['p2p-port']) } : {}),
    ...(result['boot-nodes'] ? { bootNodes: splitList(String(result['boot-nodes'])) } : {}),
    ...(result['eth-url'] ? { eth: { url: String(result['eth-url']) } } : {}),
    ...(result['cc3-url'] ? { cc3: { url: String(result['cc3-url']) } } : {}),
    ...(typeof result.noMdns === 'boolean' ? { noMdns: result.noMdns } : {}),
  };
}

export function mergeConfig(fileConfig: RawConfig, envConfig: Partial<OperatorNodeConfig>, cliConfig: Partial<OperatorNodeConfig>): OperatorNodeConfig {
  const merged = deepMerge(deepMerge(fileConfig as OperatorNodeConfig, envConfig), cliConfig);
  const parsed = schema.safeParse({
    name: merged.name ?? 'proofloan-attestor',
    chainKey: merged.chainKey ?? 1,
    secret: merged.secret ?? '',
    publicAddress: merged.publicAddress,
    logsPath: merged.logsPath ?? './logs',
    apiPort: merged.apiPort ?? 9100,
    p2pPort: merged.p2pPort ?? 9000,
    noMdns: merged.noMdns ?? true,
    bootNodes: merged.bootNodes ?? [],
    eth: merged.eth ?? { url: '' },
    cc3: merged.cc3 ?? { url: '' },
  });
  if (!parsed.success) throw new OperatorError("CONFIG", parsed.error.message);
  return parsed.data as OperatorNodeConfig;
}

export function configSources(): OperatorConfigSource[] { return ['file', 'env', 'cli', 'merged']; }

function integerFrom(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}
function parseBool(value: string | undefined): boolean | undefined { if (value === undefined) return undefined; return value === 'true' || value === '1' || value === 'yes'; }
function splitList(value: string | undefined): string[] | undefined { if (!value) return undefined; return value.split(',').map(v => v.trim()).filter(Boolean); }
function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> { return Object.fromEntries(Object.entries(input).filter(([,v]) => v !== undefined)) as Partial<T>; }
function deepMerge<T extends Record<string, any>>(left: T, right: Partial<T>): T { const result = { ...left } as any; for (const [key, value] of Object.entries(right)) { if (value && typeof value === 'object' && !Array.isArray(value) && left[key] && typeof left[key] === 'object') result[key] = deepMerge(left[key], value as any); else result[key] = value; } return result; }