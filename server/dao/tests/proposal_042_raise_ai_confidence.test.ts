import { describe, expect, it } from "vitest";
import { proposalFixture042 } from "../fixtures/proposal_042_raise_ai_confidence.ts";
import { validateProofLoanProposal } from "../core/guards";
describe("DAO governance fixture 042",()=>{
  it("is explicit and deterministic",()=>{ expect(proposalFixture042.kind).toBe("ai-model"); expect(proposalFixture042.actions.length).toBe(1); });
  it("passes governance guard shape",()=>{ const proposal:any={...proposalFixture042,id:"dao-test",proposer:"member",createdAt:"2026-01-01T00:00:00.000Z",startAt:"2026-01-01T00:00:00.000Z",endAt:"2026-01-02T00:00:00.000Z",status:"draft",snapshotBlock:1,quorumBps:1000,approvalBps:5000,votes:[],metadata:{}}; const e=validateProofLoanProposal(proposal); expect(e.length).toBe(0); });
});
