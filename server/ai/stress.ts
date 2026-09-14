import type { FeatureVector } from "@shared/proofloan";
export function stressFeatureVector(f:FeatureVector,shock:number):FeatureVector{return {...f,latePayments:f.latePayments+Math.max(0,Math.round(shock)),leverageRatio:Math.max(0,f.leverageRatio*(1+shock*.25)),freshnessScore:Math.max(0,f.freshnessScore-shock*.2)}}
