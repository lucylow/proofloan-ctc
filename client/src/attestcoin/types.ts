export type AttestcoinUiState =
  | "idle"
  | "validating"
  | "fetching"
  | "verifying"
  | "complete"
  | "error"
  | "preview";

export type AttestcoinUiError = {
  kind: string;
  message: string;
  retriable: boolean;
};

export type AttestcoinProofProgress = {
  state: AttestcoinUiState;
  label: string;
  progress: number;
  requestId?: string;
  error?: AttestcoinUiError;
};
