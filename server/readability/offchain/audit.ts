import { digestObject } from "./hash";
export type AuditEntry={time:string;action:string;jobId?:string;eventId?:string;meta?:Record<string,unknown>;digest:string};
export class WorkerAudit {
  private entries:AuditEntry[]=[];
  append(action:string,meta:Omit<AuditEntry,"time"|"action"|"digest">={} as any){const entry={...meta,time:new Date().toISOString(),action,digest:""} as AuditEntry;entry.digest=digestObject(entry);this.entries.push(entry);return entry;}
  list(){return [...this.entries];}
}
