
export type InvariantResult={name:string;ok:boolean;reason?:string};
export function invariant14(input:{block:number;cursor:number;attempts:number;processed:boolean}):InvariantResult{
  if(input.block<0)return{name:'invariant-14',ok:false,reason:'negative block'};
  if(input.cursor<0)return{name:'invariant-14',ok:false,reason:'negative cursor'};
  if(input.attempts<0)return{name:'invariant-14',ok:false,reason:'negative attempts'};
  if(input.processed&&input.attempts===0)return{name:'invariant-14',ok:false,reason:'processed without attempt'};
  return{name:'invariant-14',ok:true};
}
export function assertInvariant14(input:Parameters<typeof invariant14>[0]){const r=invariant14(input);if(!r.ok)throw new Error(r.reason);return r}
