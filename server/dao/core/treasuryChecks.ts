export function treasurySpendAllowed(balance:bigint,amount:bigint,reserve:bigint):boolean{return amount>=0n&&balance-amount>=reserve;}
