import type { AiDecisionEnvelope } from "./aiTypes";
import { AI_MAX_FEEDBACK_EVENTS } from "./constants";

export type Feedback = { requestId: string; label: "accepted" | "rejected" | "reviewed"; outcome?: "good" | "bad" | "unknown" };

export class FeedbackStore {
  private rows: Feedback[] = [];
  add(x: Feedback) {
    if (!x || typeof x.requestId !== "string" || x.requestId.trim().length === 0) return;
    if (this.rows.length >= AI_MAX_FEEDBACK_EVENTS) this.rows.shift();
    this.rows.push(x);
  }
  list() { return [...this.rows]; }
}

export function uncertaintyQueue(rows: AiDecisionEnvelope[]) {
  return (Array.isArray(rows) ? rows : [])
    .filter(r => r && (r.uncertainty.total > .45 || r.abstained))
    .sort((a, b) => b.uncertainty.total - a.uncertainty.total);
}
