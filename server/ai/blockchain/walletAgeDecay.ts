export function ageDecay(days:number,halfLife=365){ return Math.exp(-Math.max(0,days)/Math.max(1,halfLife)); }
