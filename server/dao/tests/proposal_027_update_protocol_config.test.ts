import { describe, expect, it } from "vitest";
import { proposalFixture027 } from "../fixtures/proposal_027_update_protocol_config.ts";
import { validateProofLoanProposal } from "../core/guards";
describe("DAO governance fixture 027",()=>{
  it("is explicit and deterministic",()=>{ expect(proposalFixture027.kind).toBe("protocol-config"); expect(proposalFixture027.actions.length).toBe(1); });
  it("passes governance guard shape",()=>{ const proposal:any={...proposalFixture027,id:"dao-test",proposer:"member",createdAt:"2026-01-01T00:00:00.000Z",startAt:"2026-01-01T00:00:00.000Z",endAt:"2026-01-02T00:00:00.000Z",status:"draft",snapshotBlock:1,quorumBps:1000,approvalBps:5000,votes:[],metadata:{}}; const e=validateProofLoanProposal(proposal); expect(e.length).toBe(0); });
});
