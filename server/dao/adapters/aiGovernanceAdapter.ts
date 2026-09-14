import type { GovernanceProposal } from "../core/types";
export interface AiGovernanceAdapter { validateProposal(p:GovernanceProposal):Promise<{ok:boolean;reasons:string[]}>; apply(p:GovernanceProposal):Promise<{txHash:string;applied:boolean}>; }
export class DryRunAiGovernanceAdapter implements AiGovernanceAdapter { async validateProposal(p:GovernanceProposal){const r:string[]=[]; if(p.kind!=="ai-model")r.push("unsupported AI governance kind"); return {ok:r.length===0,reasons:r};} async apply(p:GovernanceProposal){return {txHash:`dry-${p.id}`,applied:true};} }
