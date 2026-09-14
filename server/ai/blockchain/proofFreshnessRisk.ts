export function proofFreshnessRisk(ageMs:number, ttlMs:number){ if(ageMs<=0)return 0; return Math.min(1,ageMs/Math.max(1,ttlMs)); }
