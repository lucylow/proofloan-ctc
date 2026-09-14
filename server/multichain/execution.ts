import type {
  AtcFreeReadQuoteInput,
  AtcPrepareActionInput,
  AtcSettleActionInput,
} from "@shared/atc";
import { atcService } from "../atc";
import { getCachedAttestcoinEnvironment } from "./environment";
import { canonicalRequestHash } from "./proofRecord";
import { auditCostClass } from "./audit";
import type { CreditcoinExecutionAdapter } from "./adapters";

/**
 * Production boundary for Creditcoin execution.
 * Free cross-chain reads never spend ATC. Paid actions settle through the
 * existing ATC service and must not invent live protocol calls.
 */
export class AttestcoinCreditcoinExecutionAdapter implements CreditcoinExecutionAdapter {
  quoteFreeRead(input: AtcFreeReadQuoteInput) {
    const environment = input.environment ?? getCachedAttestcoinEnvironment().id;
    const quote = atcService.freeReadQuote({ ...input, environment });
    auditCostClass({
      event: "free-read",
      requestHash: canonicalRequestHash({
        environment,
        sourceChain: quote.sourceChain,
        chainKey: 0,
        txHash: `0x${"0".repeat(64)}`,
      }),
      environment,
      sourceChain: quote.sourceChain,
    });
    return quote;
  }

  preparePaidAction(input: AtcPrepareActionInput) {
    const environment = input.environment ?? getCachedAttestcoinEnvironment().id;
    return atcService.prepareAction({ ...input, environment });
  }

  async settlePaidAction(input: AtcSettleActionInput) {
    const receipt = await atcService.settleAction(input);
    auditCostClass({
      event: "paid-action",
      requestHash: receipt.actionId,
      environment: input.environment,
      sourceChain: input.action.sourceChain,
    });
    return receipt;
  }
}

export const creditcoinExecutionAdapter = new AttestcoinCreditcoinExecutionAdapter();
