export interface RepaymentStep { due:number; paid:number; paidAtMs:number; dueAtMs:number; }
export function repaymentConsistency(steps:RepaymentStep[]){ if(!steps.length)return 0; let score=0; for(const s of steps){ const onTime=s.paidAtMs<=s.dueAtMs; const full=s.paid>=s.due; score += (onTime?0.6:0)+(full?0.4:0); } return score/steps.length; }
