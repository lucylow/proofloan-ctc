export class AttestorError extends Error {
  constructor(public readonly code: string, message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "AttestorError";
  }
}

export const attestorError = (code: string, message: string, details?: Record<string, unknown>) => new AttestorError(code, message, details);
