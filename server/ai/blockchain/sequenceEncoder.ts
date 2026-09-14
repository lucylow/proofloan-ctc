export interface SequenceEvent { kind:string; amount:number; deltaMs:number; }
const kinds=['in','out','repay','bridge','swap','unknown'];
export function encodeSequence(events:SequenceEvent[]){ return events.slice(-32).map(e=>[kinds.indexOf(e.kind)>=0?kinds.indexOf(e.kind):kinds.length,Math.tanh(e.amount/10000),Math.exp(-Math.max(0,e.deltaMs)/86_400_000)]); }
