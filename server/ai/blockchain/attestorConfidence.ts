export interface AttestorSignal { availability:number; consistency:number; diversity:number; }
export function attestorConfidence(s:AttestorSignal){ return Math.max(0,Math.min(1,0.4*s.availability+0.4*s.consistency+0.2*s.diversity)); }
