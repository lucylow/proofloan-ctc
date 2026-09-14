import { AttestcoinError } from "../attestcoin/errors";

export type CircuitState = "closed" | "open" | "half-open";

export type NamedCircuitDiagnostics = {
  name: string;
  state: CircuitState;
  failures: number;
  openedAt: number | null;
  successes: number;
};

export class NamedCircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successes = 0;
  private openedAt = 0;
  private halfOpenInFlight = false;

  constructor(
    readonly name: string,
    private readonly failureThreshold = 3,
    private readonly cooldownMs = 20_000,
  ) {}

  getState(now = Date.now()): CircuitState {
    if (this.state === "open" && now - this.openedAt >= this.cooldownMs) {
      this.state = "half-open";
      this.halfOpenInFlight = false;
    }
    return this.state;
  }

  async run<T>(operation: () => Promise<T>, now = Date.now()): Promise<T> {
    const state = this.getState(now);
    if (state === "open") {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        `Attestcoin circuit '${this.name}' is open.`,
        { retriable: true },
      );
    }
    if (state === "half-open" && this.halfOpenInFlight) {
      throw new AttestcoinError(
        "CIRCUIT_OPEN",
        `Attestcoin circuit '${this.name}' is probing and not accepting additional requests.`,
        { retriable: true },
      );
    }

    if (state === "half-open") this.halfOpenInFlight = true;

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(now);
      throw error;
    } finally {
      this.halfOpenInFlight = false;
    }
  }

  private recordSuccess() {
    this.failures = 0;
    this.successes += 1;
    this.state = "closed";
  }

  private recordFailure(now: number) {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "open";
      this.openedAt = now;
    }
  }

  diagnostics(now = Date.now()): NamedCircuitDiagnostics {
    return {
      name: this.name,
      state: this.getState(now),
      failures: this.failures,
      openedAt: this.openedAt || null,
      successes: this.successes,
    };
  }
}

const circuits = new Map<string, NamedCircuitBreaker>();

export function getNamedCircuit(
  name: string,
  failureThreshold = 3,
  cooldownMs = 20_000,
) {
  const existing = circuits.get(name);
  if (existing) return existing;
  const created = new NamedCircuitBreaker(name, failureThreshold, cooldownMs);
  circuits.set(name, created);
  return created;
}

export function resetNamedCircuits() {
  circuits.clear();
}

export function listNamedCircuitDiagnostics() {
  return Array.from(circuits.values()).map(circuit => circuit.diagnostics());
}
