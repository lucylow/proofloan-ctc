export const PROOFLOAN_CONSTITUTION = {
  evidenceFirst: true,
  riskGuardCannotBeDisabledByStandardProposal: true,
  attestationRequiredForLiveCrossChainEvidence: true,
  aiCannotMintEvidence: true,
  mockDataMustBeExplicitlyMarked: true,
  freeReadsRemainFreeByPolicy: true,
  emergencyActionsMustExpire: true,
  governanceActionsAreAuditable: true,
};
export function constitutionCheck(change:{target:string;selector:string}):string[]{const e:string[]=[]; if(change.selector.includes("disableRiskGuard"))e.push("RiskGuard cannot be disabled"); if(change.selector.includes("acceptUnverifiedEvidence"))e.push("Unverified evidence cannot become authoritative"); if(change.selector.includes("hideMockMode"))e.push("Mock mode must remain explicit"); return e;}
