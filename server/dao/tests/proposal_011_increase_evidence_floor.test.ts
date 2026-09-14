import { describe, expect, it } from "vitest";
import { proposalFixture011 } from "../fixtures/proposal_011_increase_evidence_floor.ts";
import { validateProofLoanProposal } from "../core/guards";
describe("DAO governance fixture 011",()=>{
  it("is explicit and deterministic",()=>{ expect(proposalFixture011.kind).toBe("risk-policy"); expect(proposalFixture011.actions.length).toBe(1); });
  it("passes governance guard shape",()=>{ const proposal:any={...proposalFixture011,id:"dao-test",proposer:"member",createdAt:"2026-01-01T00:00:00.000Z",startAt:"2026-01-01T00:00:00.000Z",endAt:"2026-01-02T00:00:00.000Z",status:"draft",snapshotBlock:1,quorumBps:1000,approvalBps:5000,votes:[],metadata:{}}; const e=validateProofLoanProposal(proposal); expect(e.length).toBe(0); });
});
