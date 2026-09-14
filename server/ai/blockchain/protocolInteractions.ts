export interface ProtocolInteraction { protocol:string; chainId:string; count:number; value:number; }
export function protocolCount(items:ProtocolInteraction[]){ return new Set(items.map(i=>`${i.chainId}:${i.protocol}`)).size; }
export function trustedProtocolRatio(items:ProtocolInteraction[], trusted:Set<string>){ if(!items.length)return 0; const v=items.filter(i=>trusted.has(i.protocol)).length; return v/items.length; }
