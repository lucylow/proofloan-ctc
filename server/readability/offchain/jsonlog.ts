export function serializeLog(record:Record<string,unknown>){return JSON.stringify(record,(k,v)=>typeof v==='bigint'?v.toString():v)}
