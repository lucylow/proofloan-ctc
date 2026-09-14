export function validateActionCount(count:number,max=12):boolean{return Number.isInteger(count)&&count>0&&count<=max;}
