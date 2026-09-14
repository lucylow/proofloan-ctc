import { simulate } from "./proposalSimulator";
export function stressCase001() {
  return { caseId: "stress-001", focus: "governance attack-resistance", proposalWeight: BigInt(1001), notes: ["snapshot", "quorum", "timelock", "constitution"] };
}
