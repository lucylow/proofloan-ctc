export function isotonicLikeCalibration(prob:number,observedRate:number){ return Math.max(0,Math.min(1,(prob+observedRate)/2)); }
