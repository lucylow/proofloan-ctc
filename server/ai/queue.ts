import type { AiRequest, AiDecisionEnvelope } from "./aiTypes";
import { AI_MAX_QUEUE_WAIT_MS } from "./constants";
import { AiError, normalizeAiError } from "./errors";
import { aiUnderwritingService } from "./service";

export class AiQueue {
  private running = 0;
  constructor(private limit = 4) {}

  async run(input: AiRequest): Promise<AiDecisionEnvelope> {
    const boundedLimit = Number.isFinite(this.limit) ? Math.max(1, Math.floor(this.limit)) : 4;
    const started = Date.now();
    while (this.running >= boundedLimit) {
      if (Date.now() - started > AI_MAX_QUEUE_WAIT_MS) {
        throw new AiError("TIMEOUT", "AI queue is saturated.", true);
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.running++;
    try {
      return await aiUnderwritingService.decide(input);
    } catch (error) {
      throw normalizeAiError(error);
    } finally {
      this.running--;
    }
  }
}

export const aiQueue = new AiQueue();
