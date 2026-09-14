export function debtSignal(totalDebt:number,totalAssets:number){ if(totalAssets<=0)return 1; return Math.max(0,Math.min(1,totalDebt/totalAssets)); }
