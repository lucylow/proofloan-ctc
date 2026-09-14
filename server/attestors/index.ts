export * from "./audit";
export * from "./assignments";
export * from "./availability";
export * from "./cache";
export * from "./checkpoints";
export * from "./commitment";
export * from "./config";
export * from "./consensus";
export * from "./errors";
export * from "./faults";
export * from "./hash";
export * from "./health";
export * from "./maturity";
export * from "./message";
export * from "./metrics";
export * from "./observations";
export * from "./persistence";
export * from "./policy";
export * from "./quorum";
export * from "./readProof";
export * from "./registry";
export * from "./relay";
export * from "./reputation";
export * from "./rewards";
export * from "./selection";
export * from "./service";
export * from "./signatures";
export * from "./slashing";
export * from "./validation";

import { AttestorService } from "./service";
import { configuredAttestorPolicy, configuredAttestors } from "./config";
import { createAttestorPersistence } from "./dbPersistence";

export const attestorService = new AttestorService({
  attestors: configuredAttestors(),
  policy: configuredAttestorPolicy(),
  persistence: createAttestorPersistence(),
});
