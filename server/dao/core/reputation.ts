export function adjustReputation(current:number,delta:number):number{return Math.max(0,Math.min(100,current+delta));}
