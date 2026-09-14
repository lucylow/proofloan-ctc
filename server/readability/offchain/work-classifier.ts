export type WorkClass='discover'|'attest'|'prove'|'submit'|'confirm';
export function classifyPhase(phase:string):WorkClass|null{if(phase==='created'||phase==='discovered')return'discover';if(phase==='matured')return'attest';if(phase==='proof-building')return'prove';if(phase==='proof-ready'||phase==='submitting')return'submit';if(phase==='submitted')return'confirm';return null}
