export function bridgeRisk(bridgeTransactions:number,totalTransactions:number){ if(totalTransactions<=0)return 0; return Math.max(0,Math.min(1,bridgeTransactions/totalTransactions)); }
