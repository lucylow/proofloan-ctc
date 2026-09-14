export type AttestorCapabilities = {
  readVerification: boolean;
  messageSigning: boolean;
  aggregateSignatures: boolean;
  continuityProofs: boolean;
  rewards: boolean;
  slashingEvidence: boolean;
  permissionlessRetry: boolean;
};

export const attestcoinCapabilities: AttestorCapabilities = {
  readVerification: true,
  messageSigning: true,
  aggregateSignatures: true,
  continuityProofs: true,
  rewards: true,
  slashingEvidence: true,
  permissionlessRetry: true,
};
