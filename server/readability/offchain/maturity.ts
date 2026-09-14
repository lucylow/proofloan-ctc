import type { SourceLog } from "./types";

export function confirmations(latest:number,event:SourceLog){ return Math.max(0,latest-event.blockNumber); }
export function mature(latest:number,event:SourceLog,minConfirmations:number,reorgBuffer:number){ return confirmations(latest,event)>=minConfirmations+reorgBuffer; }
