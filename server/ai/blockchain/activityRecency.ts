export function activityRecency(lastSeenMs:number|undefined,nowMs:number){ if(!lastSeenMs)return 0; return Math.exp(-Math.max(0,nowMs-lastSeenMs)/7/86_400_000); }
