export function collateralQuality(liquidity:number,volatility:number,concentrationRisk:number){ return Math.max(0,Math.min(1,0.5*liquidity+0.3*(1-volatility)+0.2*(1-concentrationRisk))); }
