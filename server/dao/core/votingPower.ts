import type { GovernanceMember } from "./types";
export function computeEffectiveVotingPower(members: Map<string, GovernanceMember>): Map<string, bigint> {
  const result = new Map<string, bigint>();
  for (const member of members.values()) if (member.active) result.set(member.address, 0n);
  for (const member of members.values()) {
    if (!member.active) continue;
    let target = member.address; const seen = new Set<string>();
    while (members.get(target)?.delegatedTo) {
      if (seen.has(target)) break;
      seen.add(target);
      target = members.get(target)!.delegatedTo!;
    }
    result.set(target, (result.get(target) ?? 0n) + member.votingPower);
  }
  return result;
}
