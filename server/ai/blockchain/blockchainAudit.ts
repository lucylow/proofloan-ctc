export interface BlockchainAuditEvent { type:string; subject:string; payload:Record<string,unknown>; at:number; }
export class BlockchainAuditJournal { readonly events:BlockchainAuditEvent[]=[]; append(type:string,subject:string,payload:Record<string,unknown>){this.events.push({type,subject,payload,at:Date.now()});}}
