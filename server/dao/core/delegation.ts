import { DaoError } from "../errors";
import type { GovernanceMember } from "./types";

export class DelegationEngine {
  constructor(private readonly members: Map<string, GovernanceMember>) {}

  delegate(from: string, to: string): void {
    const sourceAddress = from.trim();
    const targetAddress = to.trim();
    if (!sourceAddress || !targetAddress) throw new DaoError("DELEGATION", "delegation addresses are required");
    if (sourceAddress === targetAddress) throw new DaoError("DELEGATION", "Self-delegation is not allowed");
    const src = this.members.get(sourceAddress);
    const dst = this.members.get(targetAddress);
    if (!src || !dst || !src.active || !dst.active) {
      throw new DaoError("DELEGATION", "Inactive or unknown delegation participant");
    }
    let cursor = targetAddress;
    for (let i = 0; i < 16; i++) {
      if (cursor === sourceAddress) throw new DaoError("DELEGATION", "Delegation cycle detected");
      const next = this.members.get(cursor)?.delegatedTo;
      if (!next) break;
      cursor = next;
    }
    src.delegatedTo = targetAddress;
  }

  clear(from: string): void {
    const member = this.members.get(from.trim());
    if (member) delete member.delegatedTo;
  }
}
