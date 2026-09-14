import {
  ATC_BPS_DENOMINATOR,
  ATC_DEMO_SPLIT_DISCLAIMER,
  atcExternalChains,
  type AtcFeePolicy,
  type AtcIntegrationMode,
  type AtcOperator,
  parseAtomic,
} from "@shared/atc";
import { AtcError } from "./errors";

const DEFAULT_OPERATORS: AtcOperator[] = [
  {
    operatorId: "op-alpha",
    name: "Independent operator Alpha",
    weight: 50,
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    operatorId: "op-beta",
    name: "Independent operator Beta",
    weight: 30,
    address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
  {
    operatorId: "op-gamma",
    name: "Independent operator Gamma",
    weight: 20,
    address: "0xcccccccccccccccccccccccccccccccccccccccc",
  },
];

export type AtcRuntimeConfig = {
  mode: AtcIntegrationMode;
  pricingVersion: string;
  decimals: number;
  baseActionFeeAtomic: string;
  payloadByteFeeAtomic: string;
  proofFeeAtomic: string;
  fastMultiplierBps: number;
  operatorRewardBps: number;
  burnBps: number;
  treasuryBps: number;
  minActionFeeAtomic: string;
  maxActionFeeAtomic: string;
  quoteTtlSeconds: number;
  operators: AtcOperator[];
  paymentDestination: string;
  paymentAdapterUrl?: string;
  paymentContract?: string;
  protocolAdapterUrl?: string;
};

function readInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new AtcError("POLICY", `${name} must be an integer.`);
  }
  return value;
}

function readAtomic(name: string, fallback: string): string {
  const raw = process.env[name] ?? fallback;
  parseAtomic(raw, name);
  return raw;
}

function readOperators(): AtcOperator[] {
  const raw = process.env.ATC_OPERATORS_JSON;
  if (!raw) return DEFAULT_OPERATORS;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AtcError("POLICY", "ATC_OPERATORS_JSON is not valid JSON.");
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new AtcError("POLICY", "ATC_OPERATORS_JSON must be a non-empty array.");
  }
  return parsed.map((item, index) => {
    const operator = item as Partial<AtcOperator>;
    if (
      typeof operator.operatorId !== "string" ||
      typeof operator.name !== "string" ||
      typeof operator.address !== "string" ||
      typeof operator.weight !== "number" ||
      !Number.isInteger(operator.weight) ||
      operator.weight <= 0
    ) {
      throw new AtcError("POLICY", `ATC operator at index ${index} is invalid.`);
    }
    return {
      operatorId: operator.operatorId.trim(),
      name: operator.name.trim(),
      address: operator.address.trim(),
      weight: operator.weight,
    };
  });
}

export function loadAtcConfigFromEnv(): AtcRuntimeConfig {
  const modeRaw = (process.env.ATC_INTEGRATION_MODE ?? "simulated").trim();
  if (modeRaw !== "simulated" && modeRaw !== "external") {
    throw new AtcError("POLICY", "ATC_INTEGRATION_MODE must be simulated or external.");
  }
  return {
    mode: modeRaw,
    pricingVersion: process.env.ATC_PRICING_VERSION ?? "proofloan-demo-v1",
    decimals: readInteger("ATC_DECIMALS", 18),
    baseActionFeeAtomic: readAtomic("ATC_BASE_ACTION_FEE_ATOMIC", "100000000000000000"),
    payloadByteFeeAtomic: readAtomic("ATC_PAYLOAD_BYTE_FEE_ATOMIC", "100000000000000"),
    proofFeeAtomic: readAtomic("ATC_PROOF_FEE_ATOMIC", "50000000000000000"),
    fastMultiplierBps: readInteger("ATC_FAST_MULTIPLIER_BPS", 12_500),
    operatorRewardBps: readInteger("ATC_OPERATOR_REWARD_BPS", 7_000),
    burnBps: readInteger("ATC_BURN_BPS", 3_000),
    treasuryBps: readInteger("ATC_TREASURY_BPS", 0),
    minActionFeeAtomic: readAtomic("ATC_MIN_ACTION_FEE_ATOMIC", "100000000000000000"),
    maxActionFeeAtomic: readAtomic("ATC_MAX_ACTION_FEE_ATOMIC", "5000000000000000000"),
    quoteTtlSeconds: readInteger("ATC_QUOTE_TTL_SECONDS", 120),
    operators: readOperators(),
    paymentDestination:
      process.env.ATC_PAYMENT_DESTINATION ?? "atc:simulated:fee-sink",
    paymentAdapterUrl: process.env.ATC_PAYMENT_ADAPTER_URL || undefined,
    paymentContract: process.env.ATC_PAYMENT_CONTRACT || undefined,
    protocolAdapterUrl: process.env.ATC_PROTOCOL_ADAPTER_URL || undefined,
  };
}

export function assertAtcConfig(config: AtcRuntimeConfig): void {
  if (config.decimals < 0 || config.decimals > 36) {
    throw new AtcError("POLICY", "ATC decimals must be between 0 and 36.");
  }
  if (config.fastMultiplierBps < ATC_BPS_DENOMINATOR) {
    throw new AtcError("POLICY", "Fast multiplier must be at least 10000 bps.");
  }
  if (config.quoteTtlSeconds < 5 || config.quoteTtlSeconds > 3_600) {
    throw new AtcError("POLICY", "ATC quote TTL must be between 5 and 3600 seconds.");
  }
  const splitTotal = config.operatorRewardBps + config.burnBps + config.treasuryBps;
  if (splitTotal !== ATC_BPS_DENOMINATOR) {
    throw new AtcError(
      "POLICY",
      `ATC fee split must total ${ATC_BPS_DENOMINATOR} bps. Received ${splitTotal}.`,
    );
  }
  if (config.operatorRewardBps < 0 || config.burnBps < 0 || config.treasuryBps < 0) {
    throw new AtcError("POLICY", "ATC fee split basis points cannot be negative.");
  }
  if (parseAtomic(config.minActionFeeAtomic) > parseAtomic(config.maxActionFeeAtomic)) {
    throw new AtcError("POLICY", "ATC min action fee cannot exceed max action fee.");
  }
  if (config.operators.length === 0) {
    throw new AtcError("POLICY", "At least one ATC operator is required.");
  }
  const ids = new Set(config.operators.map(operator => operator.operatorId));
  if (ids.size !== config.operators.length) {
    throw new AtcError("POLICY", "ATC operator IDs must be unique.");
  }
}

export function toPublicFeePolicy(config: AtcRuntimeConfig): AtcFeePolicy {
  assertAtcConfig(config);
  return {
    pricingVersion: config.pricingVersion,
    decimals: config.decimals,
    baseActionFeeAtomic: config.baseActionFeeAtomic,
    payloadByteFeeAtomic: config.payloadByteFeeAtomic,
    proofFeeAtomic: config.proofFeeAtomic,
    fastMultiplierBps: config.fastMultiplierBps,
    operatorRewardBps: config.operatorRewardBps,
    burnBps: config.burnBps,
    treasuryBps: config.treasuryBps,
    minActionFeeAtomic: config.minActionFeeAtomic,
    maxActionFeeAtomic: config.maxActionFeeAtomic,
    quoteTtlSeconds: config.quoteTtlSeconds,
    disclaimer: ATC_DEMO_SPLIT_DISCLAIMER,
  };
}

export function isExternalAdapterConfigured(config: AtcRuntimeConfig): boolean {
  return Boolean(config.paymentAdapterUrl || config.paymentContract);
}

export function supportedExternalChainIds(): string[] {
  return Object.keys(atcExternalChains);
}
