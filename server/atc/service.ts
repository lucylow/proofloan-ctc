import { randomUUID } from "node:crypto";
import {
  ATC_DEMO_SPLIT_DISCLAIMER,
  ATC_MINTED_ATOMIC,
  atcActionKinds,
  atcChainIds,
  atcEnvironments,
  type AtcActionEnvelope,
  type AtcCapabilities,
  type AtcFreeReadQuoteInput,
  type AtcHealth,
  type AtcPrepareActionInput,
  type AtcPreparedAction,
  type AtcQuote,
  type AtcQuoteActionFeeInput,
  type AtcSettleActionInput,
} from "@shared/atc";
import { AtcAuditLog } from "./audit";
import {
  assertAtcConfig,
  isExternalAdapterConfigured,
  loadAtcConfigFromEnv,
  toPublicFeePolicy,
  type AtcRuntimeConfig,
} from "./config";
import { AtcError, normalizeAtcError } from "./errors";
import { AtcLedger } from "./ledger";
import { AtcMetricsStore } from "./metrics";
import { createClaimableRewards, operatorClaimSummary } from "./operatorClaims";
import { allocateOperatorRewards } from "./operators";
import { createAtcPaymentAdapter, type AtcPaymentAdapter } from "./payment";
import {
  persistAtcFee,
  persistAtcQuote,
  persistAtcReceipt,
  persistAtcRewards,
} from "./persistence";
import { createAtcProtocolAdapter, type AtcProtocolAdapter } from "./protocol";
import { hashAtcPayload, quoteActionFee, quoteFreeRead } from "./pricing";
import { attestorService } from "../attestors";
import { AttestorService } from "../attestors/service";
import {
  assertOperationalAttestorSet,
  attestorsAsAtcOperators,
} from "../attestors/operational";
import { AttestorError } from "../attestors/errors";
import {
  assertActionMatchesQuote,
  assertPayloadIntegrity,
  assertQuoteFresh,
  assertQuoteIntegrity,
  assertSenderShape,
  requestFingerprint,
  resolveActionChains,
} from "./validation";

export type AtcClock = { now(): Date };

export type AtcServiceOptions = {
  config?: AtcRuntimeConfig;
  clock?: AtcClock;
  payment?: AtcPaymentAdapter;
  protocol?: AtcProtocolAdapter;
  attestors?: AttestorService;
};

export class AtcService {
  readonly config: AtcRuntimeConfig;
  private readonly clock: AtcClock;
  private readonly ledger = new AtcLedger();
  private readonly metrics = new AtcMetricsStore();
  private readonly audit = new AtcAuditLog();
  private readonly payment: AtcPaymentAdapter;
  private readonly protocol: AtcProtocolAdapter;
  private readonly attestors: AttestorService;

  constructor(options: AtcServiceOptions = {}) {
    this.config = options.config ?? loadAtcConfigFromEnv();
    assertAtcConfig(this.config);
    this.clock = options.clock ?? { now: () => new Date() };
    this.payment = options.payment ?? createAtcPaymentAdapter(this.config);
    this.protocol = options.protocol ?? createAtcProtocolAdapter(this.config);
    this.attestors = options.attestors ?? attestorService;
  }

  private requireOperationalAttestors(environment: string) {
    try {
      return assertOperationalAttestorSet(this.attestors, environment);
    } catch (error) {
      if (error instanceof AttestorError) {
        throw new AtcError("POLICY", error.message);
      }
      throw error;
    }
  }

  private operatorRewardRecipients(environment: string) {
    const attestorOperators = attestorsAsAtcOperators(this.attestors, environment);
    return attestorOperators.length > 0 ? attestorOperators : this.config.operators;
  }

  feePolicy() {
    return toPublicFeePolicy(this.config);
  }

  health(): AtcHealth {
    const policyHealthy = true;
    const liveConfigured = isExternalAdapterConfigured(this.config);
    const liveProtocolEnabled = this.config.mode === "external" && liveConfigured;
    const adapterReady = this.config.mode === "simulated" || liveConfigured;
    return {
      mode: this.config.mode,
      pricingVersion: this.config.pricingVersion,
      policyHealthy,
      adapterReady,
      liveProtocolEnabled,
      operators: this.config.operators.length,
      mintingEnabled: false,
      message: liveProtocolEnabled
        ? "External ATC adapter is configured; live protocol settlement still requires the canonical Attestcoin payment surface."
        : this.config.mode === "external"
          ? "External ATC mode is selected, but the canonical payment adapter is not configured."
          : "ATC integration is running in simulated protocol/payment mode.",
    };
  }

  capabilities(): AtcCapabilities {
    return {
      freeReads: true,
      paidActions: true,
      minting: false,
      actionKinds: atcActionKinds,
      environments: atcEnvironments,
      chains: atcChainIds,
      liveProtocolTransport: this.config.mode === "external" && Boolean(this.config.protocolAdapterUrl),
      configurableFeeSplit: true,
      officialSplitPublished: false,
    };
  }

  summary() {
    return {
      ...this.metrics.snapshot(),
      claims: operatorClaimSummary(this.ledger),
      auditHead: this.audit.head(),
      disclaimer: ATC_DEMO_SPLIT_DISCLAIMER,
      mintedAtomic: ATC_MINTED_ATOMIC,
    };
  }

  freeReadQuote(input: AtcFreeReadQuoteInput): AtcQuote {
    const sourceChain = input.sourceChain ?? "ethereum-sepolia";
    const destinationChain = input.destinationChain ?? "creditcoin";
    const chains = resolveActionChains(sourceChain, destinationChain, "read");
    const quote = quoteFreeRead(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now(),
    );
    this.ledger.putQuote(quote);
    void persistAtcQuote(quote);
    this.metrics.recordReadQuote();
    this.audit.append("read-quote", "Zero-ATC read quote issued.", { quoteId: quote.quoteId });
    return quote;
  }

  quoteAction(input: AtcQuoteActionFeeInput): AtcQuote {
    assertSenderShape(input.sender);
    this.requireOperationalAttestors(input.environment);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now(),
    );
    this.ledger.putQuote(quote);
    void persistAtcQuote(quote);
    this.metrics.recordActionQuote();
    this.audit.append("action-quote", `Quoted ${quote.totalAtomic} atomic ATC for ${quote.actionKind}.`, {
      quoteId: quote.quoteId,
    });
    return quote;
  }

  dryRunAction(input: AtcPrepareActionInput) {
    assertSenderShape(input.sender);
    this.requireOperationalAttestors(input.environment);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now(),
    );
    assertQuoteIntegrity(quote);
    assertQuoteFresh(quote, this.clock.now());
    const payloadHash = hashAtcPayload(input.payload);
    assertPayloadIntegrity(input.payload, payloadHash);
    const allocations = allocateOperatorRewards(
      quote.operatorRewardAtomic,
      this.operatorRewardRecipients(input.environment),
    );
    return {
      valid: true as const,
      quote,
      payloadHash,
      operatorAllocations: allocations,
      reserved: false as const,
      mintedAtomic: ATC_MINTED_ATOMIC,
    };
  }

  async prepareAction(input: AtcPrepareActionInput): Promise<AtcPreparedAction> {
    assertSenderShape(input.sender);
    this.requireOperationalAttestors(input.environment);
    const chains = resolveActionChains(input.sourceChain, input.destinationChain, "action");
    const payloadHash = hashAtcPayload(input.payload);
    const fingerprint = requestFingerprint({
      environment: input.environment,
      sender: input.sender,
      sourceChain: chains.sourceChain,
      destinationChain: chains.destinationChain,
      actionKind: input.actionKind,
      payloadHash,
      proofCount: input.proofCount,
      priority: input.priority,
    });
    const existing = this.ledger.getPrepared(input.idempotencyKey);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new AtcError(
          "IDEMPOTENCY",
          "A changed ATC idempotency key cannot silently redirect an existing fee reservation.",
        );
      }
      if (existing.receipt.status !== "settled") {
        assertQuoteFresh(existing.quote, this.clock.now());
      }
      return {
        action: existing.action,
        quote: existing.quote,
        payment: this.payment.createPaymentInstruction({
          actionId: existing.action.actionId,
          quoteId: existing.quote.quoteId,
          amountAtomic: existing.quote.totalAtomic,
          destination: this.config.paymentDestination,
        }),
        fee: existing.fee,
        operatorAllocations: existing.allocations,
      };
    }
    const quote = quoteActionFee(
      input,
      this.feePolicy(),
      chains.sourceChain,
      chains.destinationChain,
      this.clock.now(),
    );
    assertQuoteIntegrity(quote);
    assertQuoteFresh(quote, this.clock.now());
    const action: AtcActionEnvelope = {
      actionId: `atc_a_${randomUUID().replaceAll("-", "")}`,
      nonce: this.ledger.nextNonce(),
      environment: input.environment,
      sender: input.sender,
      sourceChain: chains.sourceChain,
      destinationChain: chains.destinationChain,
      actionKind: input.actionKind,
      payload: input.payload,
      payloadHash,
      proofCount: input.proofCount,
      priority: input.priority,
      idempotencyKey: input.idempotencyKey,
      quoteId: quote.quoteId,
      createdAt: this.clock.now().toISOString(),
    };
    const allocations = allocateOperatorRewards(
      quote.operatorRewardAtomic,
      this.operatorRewardRecipients(input.environment),
    );
    const payment = this.payment.createPaymentInstruction({
      actionId: action.actionId,
      quoteId: quote.quoteId,
      amountAtomic: quote.totalAtomic,
      destination: this.config.paymentDestination,
    });
    const reserved = this.ledger.reserve({
      fingerprint,
      idempotencyKey: input.idempotencyKey,
      quote,
      action,
      allocations,
    });
    this.metrics.recordPrepare();
    this.audit.append("fee-reserved", `Reserved ${quote.totalAtomic} atomic ATC.`, {
      quoteId: quote.quoteId,
      actionId: action.actionId,
      feeId: reserved.fee.feeId,
    });
    void persistAtcQuote(quote);
    void persistAtcFee(reserved.fee);
    return {
      action,
      quote,
      payment,
      fee: reserved.fee,
      operatorAllocations: allocations,
    };
  }

  async settleAction(input: AtcSettleActionInput) {
    if (input.environment !== input.action.environment || input.environment !== input.quote.environment) {
      throw new AtcError("VALIDATION", "ATC settlement environment does not match the action envelope.");
    }
    const reserved = this.ledger.getFeeByAction(input.action.actionId);
    if (!reserved) {
      throw new AtcError("VALIDATION", "ATC action must be prepared before settlement.");
    }
    if (reserved.quoteId !== input.quote.quoteId) {
      throw new AtcError("INTEGRITY", "ATC settlement quote does not match the reserved fee.");
    }
    const prepared = this.ledger.getPrepared(input.action.idempotencyKey);
    if (!prepared) {
      throw new AtcError("VALIDATION", "ATC fee reservation is missing for this idempotency key.");
    }
    if (prepared.receipt.status === "settled") {
      return prepared.receipt;
    }
    this.requireOperationalAttestors(input.environment);
    assertQuoteIntegrity(input.quote);
    assertQuoteFresh(input.quote, this.clock.now());
    assertActionMatchesQuote(input.action, input.quote);
    assertPayloadIntegrity(input.action.payload, input.quote.payloadHash);
    let payment;
    let dispatched;
    try {
      payment = await this.payment.verifyPayment({
        paymentReference: input.paymentReference,
        amountAtomic: input.quote.totalAtomic,
        sender: input.action.sender,
      });
    } catch (error) {
      throw normalizeAtcError(error);
    }
    try {
      dispatched = await this.protocol.dispatch(input.action);
    } catch (error) {
      throw normalizeAtcError(error);
    }
    const rewards = createClaimableRewards(
      reserved.feeId,
      input.action.actionId,
      prepared.allocations,
    );
    const receipt = this.ledger.settle({
      actionId: input.action.actionId,
      paymentReference: payment.paymentReference,
      protocolReference: payment.protocolReference ?? dispatched.protocolReference,
      rewards,
    });
    this.metrics.recordSettlement({
      totalAtomic: input.quote.totalAtomic,
      burnAtomic: input.quote.burnAtomic,
      operatorRewardAtomic: input.quote.operatorRewardAtomic,
      treasuryAtomic: input.quote.treasuryAtomic,
    });
    this.audit.append("fee-settled", `Settled ${input.quote.totalAtomic} atomic ATC with burn ${input.quote.burnAtomic}.`, {
      quoteId: input.quote.quoteId,
      actionId: input.action.actionId,
      feeId: reserved.feeId,
    });
    void persistAtcFee({ ...reserved, status: "settled", paymentReference: receipt.paymentReference, protocolReference: receipt.protocolReference, settledAt: receipt.settledAt });
    void persistAtcRewards(rewards);
    void persistAtcReceipt(receipt);
    this.attestors.accrueRewards(
      reserved.feeId,
      BigInt(input.quote.operatorRewardAtomic),
      "both",
      input.environment,
    );
    return receipt;
  }
}

export function createAtcService(options: AtcServiceOptions = {}): AtcService {
  return new AtcService(options);
}

export const atcService = createAtcService();
