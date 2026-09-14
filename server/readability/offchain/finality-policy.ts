export type FinalityPolicy={minConfirmations:number;reorgBuffer:number;maxAgeMs?:number};
export function isFinal(latest:number,eventBlock:number,policy:FinalityPolicy){return latest-eventBlock>=policy.minConfirmations+policy.reorgBuffer}
export function confirmationCount(latest:number,eventBlock:number){return Math.max(0,latest-eventBlock)}
