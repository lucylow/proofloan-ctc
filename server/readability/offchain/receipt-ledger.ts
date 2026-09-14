export type Receipt={txHash:string;status:number;blockNumber:number;observedAt:string};
export class ReceiptLedger{private rows=new Map<string,Receipt>();record(r:Receipt){this.rows.set(r.txHash,r)}get(txHash:string){return this.rows.get(txHash)}success(txHash:string){return this.rows.get(txHash)?.status===1}}
