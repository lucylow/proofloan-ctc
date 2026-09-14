import { driftScore } from './driftScore';
export function chainFeatureDrift(current:Record<string,number>,reference:Record<string,number>){ const keys=Object.keys(current); return keys.length?keys.reduce((s,k)=>s+driftScore([current[k]],[reference[k]??0]),0)/keys.length:0; }
