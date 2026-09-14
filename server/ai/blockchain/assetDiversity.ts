import type { Exposure } from './portfolioExposure';
export function assetDiversity(exposures:Exposure[]){ const a=new Set(exposures.map(e=>e.asset)); return Math.min(1,a.size/8); }
