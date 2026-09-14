import { randomUUID } from "node:crypto";
import type { AtcActionEnvelope } from "@shared/atc";
import type { AtcRuntimeConfig } from "./config";
import { AtcError } from "./errors";

export type AtcProtocolDispatch = {
  accepted: true;
  protocolReference: string;
  live: boolean;
};

export interface AtcProtocolAdapter {
  readonly name: "simulated" | "external";
  dispatch(action: AtcActionEnvelope): Promise<AtcProtocolDispatch>;
}

export class SimulatedAtcProtocolAdapter implements AtcProtocolAdapter {
  readonly name = "simulated" as const;

  async dispatch(action: AtcActionEnvelope): Promise<AtcProtocolDispatch> {
    return {
      accepted: true,
      protocolReference: `sim-xchain-${action.actionId}-${randomUUID().replaceAll("-", "").slice(0, 12)}`,
      live: false,
    };
  }
}

export class ExternalAtcProtocolAdapter implements AtcProtocolAdapter {
  readonly name = "external" as const;

  constructor(private readonly config: AtcRuntimeConfig) {}

  async dispatch(_action: AtcActionEnvelope): Promise<AtcProtocolDispatch> {
    if (!this.config.protocolAdapterUrl) {
      throw new AtcError(
        "PROTOCOL",
        "Live Attestcoin protocol transport is disabled until the canonical payment/action adapter is configured.",
      );
    }
    throw new AtcError(
      "ADAPTER",
      "Canonical Attestcoin protocol action transport is configured but not yet bound to an official SDK/contract surface. ProofLoan will not invent a live protocol call.",
    );
  }
}

export function createAtcProtocolAdapter(config: AtcRuntimeConfig): AtcProtocolAdapter {
  return config.mode === "external"
    ? new ExternalAtcProtocolAdapter(config)
    : new SimulatedAtcProtocolAdapter();
}
