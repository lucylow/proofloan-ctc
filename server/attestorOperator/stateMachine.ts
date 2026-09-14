import type { OperatorLifecycleEvent, OperatorStatus } from './types';
import { OperatorError } from './errors';

const transitions: Record<OperatorStatus, readonly OperatorStatus[]> = {
  unregistered: ['idle'],
  idle: ['waiting', 'unregistered'],
  waiting: ['active', 'idle'],
  active: ['leaving', 'idle', 'inactive'],
  leaving: ['idle'],
  inactive: ['idle', 'waiting'],
};

export class OperatorStateMachine {
  private readonly events: OperatorLifecycleEvent[] = [];

  canTransition(from: OperatorStatus, to: OperatorStatus): boolean { return transitions[from].includes(to); }

  transition(input: { operatorId: string; from: OperatorStatus; to: OperatorStatus; reason: string; epoch?: number }): OperatorLifecycleEvent {
    if (!this.canTransition(input.from, input.to)) {
      throw new OperatorError("LIFECYCLE", `Invalid operator transition ${input.from} -> ${input.to}`);
    }
    const event: OperatorLifecycleEvent = { operatorId: input.operatorId, from: input.from, to: input.to, reason: input.reason.slice(0, 500), epoch: input.epoch, at: new Date().toISOString() };
    this.events.push(event);
    return event;
  }

  history(operatorId?: string): OperatorLifecycleEvent[] { return this.events.filter(e => !operatorId || e.operatorId === operatorId).map(e => ({ ...e })); }
  latest(operatorId: string): OperatorLifecycleEvent | undefined { return this.history(operatorId).at(-1); }
}