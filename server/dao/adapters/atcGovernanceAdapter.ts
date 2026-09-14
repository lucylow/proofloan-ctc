import type { GovernanceProposal } from "../core/types";
export interface AtcGovernanceAdapter { validateProposal(p:GovernanceProposal):Promise<{ok:boolean;reasons:string[]}>; apply(p:GovernanceProposal):Promise<{txHash:string;applied:boolean}>; }
export class DryRunAtcGovernanceAdapter implements AtcGovernanceAdapter { async validateProposal(p:GovernanceProposal){const r:string[]=[]; if(p.kind!=="atc-fee-policy"&&p.kind!=="treasury")r.push("unsupported ATC governance kind"); return {ok:r.length===0,reasons:r};} async apply(p:GovernanceProposal){return {txHash:`dry-${p.id}`,applied:true};} }
