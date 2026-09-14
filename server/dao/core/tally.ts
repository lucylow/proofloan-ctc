import type { GovernanceMember, GovernanceProposal, VoteTally } from "./types";
import { computeEffectiveVotingPower } from "./votingPower";
export function tallyProposal(proposal: GovernanceProposal, members: Map<string, GovernanceMember>): VoteTally {
  const powers = computeEffectiveVotingPower(members);
  let total=0n, f=0n, a=0n, abstain=0n;
  const seen = new Set<string>();
  for (const vote of proposal.votes) {
    if (seen.has(vote.voter)) continue;
    seen.add(vote.voter); const weight = vote.weight > 0n ? vote.weight : (powers.get(vote.voter) ?? 0n);
    total += weight;
    if (vote.choice === "for") f += weight; else if (vote.choice === "against") a += weight; else abstain += weight;
  }
  const snapshotTotal = [...powers.values()].reduce((x,y)=>x+y,0n);
  const participationBps = snapshotTotal === 0n ? 0 : Number(total * 10000n / snapshotTotal);
  const denominator = f + a;
  const approvalBps = denominator === 0n ? 0 : Number(f * 10000n / denominator);
  const quorumReached = participationBps >= proposal.quorumBps;
  const passed = quorumReached && approvalBps >= proposal.approvalBps && f > a;
  return { total, forVotes:f, againstVotes:a, abstainVotes:abstain, participationBps, approvalBps, quorumReached, passed };
}
