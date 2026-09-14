export function evidenceUncertainty(coverage:number,freshness:number,anomaly:number){ return Math.max(0,Math.min(1,0.45*(1-coverage)+0.3*(1-freshness)+0.25*anomaly)); }
