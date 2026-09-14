export function graphAnomaly(degree:number,expected:number){ if(expected<=0)return degree>0?1:0; return Math.min(1,Math.abs(degree-expected)/(expected+1)); }
