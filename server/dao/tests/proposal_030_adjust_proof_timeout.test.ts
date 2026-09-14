import { describe, expect, it } from "vitest";
import { proposalFixture030 } from "../fixtures/proposal_030_adjust_proof_timeout.ts";
import { validateProofLoanProposal } from "../core/guards";
describe("DAO governance fixture 030",()=>{
  it("is explicit and deterministic",()=>{ expect(proposalFixture030.kind).toBe("parameter"); expect(proposalFixture030.actions.length).toBe(1); });
  it("passes governance guard shape",()=>{ const proposal:any={...proposalFixture030,id:"dao-test",proposer:"member",createdAt:"2026-01-01T00:00:00.000Z",startAt:"2026-01-01T00:00:00.000Z",endAt:"2026-01-02T00:00:00.000Z",status:"draft",snapshotBlock:1,quorumBps:1000,approvalBps:5000,votes:[],metadata:{}}; const e=validateProofLoanProposal(proposal); expect(e.length).toBe(0); });
});
