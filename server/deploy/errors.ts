export type DeployErrorKind =
  | "COMPILER"
  | "NETWORK"
  | "CHAIN_ID"
  | "CONFIG"
  | "GUARD"
  | "BALANCE"
  | "BROADCAST"
  | "ARTIFACT";

export class DeployError extends Error {
  readonly kind: DeployErrorKind;
  readonly retriable: boolean;

  constructor(
    kind: DeployErrorKind,
    message: string,
    options: { retriable?: boolean; cause?: unknown } = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "DeployError";
    this.kind = kind;
    this.retriable = options.retriable ?? false;
  }
}

export function isDeployError(error: unknown): error is DeployError {
  return error instanceof DeployError;
}
