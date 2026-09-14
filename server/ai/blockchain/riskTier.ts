export function riskTier(pd30:number,confidence:number){ if(confidence<0.35)return 'ABSTAIN'; if(pd30<0.02)return 'A'; if(pd30<0.06)return 'B'; if(pd30<0.15)return 'C'; return 'D'; }
