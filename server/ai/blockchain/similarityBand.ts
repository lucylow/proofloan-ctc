export function similarityBand(score:number){ return score>=0.9?'VERY_HIGH':score>=0.75?'HIGH':score>=0.5?'MEDIUM':score>=0.25?'LOW':'VERY_LOW'; }
