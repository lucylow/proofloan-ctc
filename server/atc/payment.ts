import { randomUUID } from "node:crypto";
import {
  ATC_TOKEN_SYMBOL,
  type AtcIntegrationMode,
  type AtcPaymentInstruction,
} from "@shared/atc";
import type { AtcRuntimeConfig } from "./config";
import { isExternalAdapterConfigured } from "./config";
import { AtcError } from "./errors";

export type AtcPaymentVerification = {
  ok: true;
  adapter: AtcIntegrationMode;
  paymentReference: string;
  protocolReference?: string;
};

export interface AtcPaymentAdapter {
  readonly name: AtcIntegrationMode;
  createPaymentInstruction(input: {
    actionId: string;
    quoteId: string;
    amountAtomic: string;
    destination: string;
  }): AtcPaymentInstruction;
  verifyPayment(input: {
    paymentReference: string;
    amountAtomic: string;
    sender: string;
  }): Promise<AtcPaymentVerification>;
}

export class SimulatedAtcPaymentAdapter implements AtcPaymentAdapter {
  readonly name = "simulated" as const;

  createPaymentInstruction(input: {
    actionId: string;
    quoteId: string;
    amountAtomic: string;
    destination: string;
  }): AtcPaymentInstruction {
    return {
      adapter: "simulated",
      token: ATC_TOKEN_SYMBOL,
      amountAtomic: input.amountAtomic,
      paymentReference: `sim-atc-${input.actionId}`,
      destination: input.destination,
      memo: `ProofLoan simulated ATC action payment for ${input.quoteId}`,
      minting: false,
    };
  }

  async verifyPayment(input: {
    paymentReference: string;
    amountAtomic: string;
    sender: string;
  }): Promise<AtcPaymentVerification> {
    if (!input.paymentReference.startsWith("sim-atc-")) {
      throw new AtcError("PAYMENT", "Simulated ATC payment reference is malformed.");
    }
    if (!input.sender || input.amountAtomic === "0") {
      throw new AtcError("PAYMENT", "Simulated ATC payment is missing sender or amount.");
    }
    return {
      ok: true,
      adapter: "simulated",
      paymentReference: input.paymentReference,
      protocolReference: `sim-protocol-${randomUUID().replaceAll("-", "").slice(0, 24)}`,
    };
  }
}

export class ExternalProtocolAtcPaymentAdapter implements AtcPaymentAdapter {
  readonly name = "external" as const;

  constructor(private readonly config: AtcRuntimeConfig) {}

  private assertConfigured(): void {
    if (!isExternalAdapterConfigured(this.config)) {
      throw new AtcError(
        "ADAPTER",
        "Canonical Attestcoin action-payment adapter is not configured. ProofLoan does not fabricate live ATC payments.",
      );
    }
  }

  createPaymentInstruction(input: {
    actionId: string;
    quoteId: string;
    amountAtomic: string;
    destination: string;
  }): AtcPaymentInstruction {
    this.assertConfigured();
    return {
      adapter: "external",
      token: ATC_TOKEN_SYMBOL,
      amountAtomic: input.amountAtomic,
      paymentReference: `ext-atc-${input.actionId}`,
      destination: this.config.paymentContract ?? input.destination,
      memo: `ProofLoan ATC action payment for ${input.quoteId}`,
      minting: false,
    };
  }

  async verifyPayment(input: {
    paymentReference: string;
    amountAtomic: string;
    sender: string;
  }): Promise<AtcPaymentVerification> {
    this.assertConfigured();
    if (!this.config.paymentAdapterUrl) {
      throw new AtcError(
        "ADAPTER",
        "Live ATC payment verification requires ATC_PAYMENT_ADAPTER_URL. ProofLoan will not invent a protocol receipt.",
      );
    }
    const timeoutMs = 15_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(this.config.paymentAdapterUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          paymentReference: input.paymentReference,
          amountAtomic: input.amountAtomic,
          sender: input.sender,
          token: ATC_TOKEN_SYMBOL,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AtcError("PAYMENT", "External ATC payment verification timed out.", true, error);
      }
      throw new AtcError("PAYMENT", "External ATC payment adapter is unreachable.", true, error);
    } finally {
      clearTimeout(timer);
    }
    if (!response.ok) {
      throw new AtcError("PAYMENT", "External ATC payment adapter rejected the verification request.", true);
    }
    let body: { ok?: boolean; reference?: string };
    try {
      body = (await response.json()) as { ok?: boolean; reference?: string };
    } catch (error) {
      throw new AtcError(
        "PAYMENT",
        "External ATC payment adapter returned a malformed verification response.",
        true,
        error,
      );
    }
    if (!body.ok || typeof body.reference !== "string" || body.reference.trim().length === 0) {
      throw new AtcError("PAYMENT", "External ATC payment adapter did not confirm the exact ATC amount.");
    }
    return {
      ok: true,
      adapter: "external",
      paymentReference: input.paymentReference,
      protocolReference: body.reference,
    };
  }
}

export function createAtcPaymentAdapter(config: AtcRuntimeConfig): AtcPaymentAdapter {
  return config.mode === "external"
    ? new ExternalProtocolAtcPaymentAdapter(config)
    : new SimulatedAtcPaymentAdapter();
}
