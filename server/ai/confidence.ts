import type { Decision } from "@shared/proofloan";
export function confidenceBand(v:number):"low"|"medium"|"high"{return v<.5?"low":v<.75?"medium":"high";}
export function confidencePenaltyForStale(base:number, staleFraction:number):number{return Math.max(0,Math.min(1,base*(1-staleFraction*.4)));}
export function confidencePenaltyForConflict(base:number, conflictCount:number):number{return Math.max(0,Math.min(1,base-Math.min(.35,conflictCount*.08)));}
export function decisionIsActionable(d:Decision):boolean{return d.confidence>=.72&&d.pd30<=.30&&d.pd90<=.42;}
