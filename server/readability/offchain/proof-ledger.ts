export type ProofRecord={eventId:string;fingerprint:string;createdAt:string};
export class ProofLedger{private rows=new Map<string,ProofRecord>();put(r:ProofRecord){this.rows.set(r.eventId,r)}get(eventId:string){return this.rows.get(eventId)}has(eventId:string){return this.rows.has(eventId)}}
