import type { FeatureVector } from "@shared/proofloan"; import { stressFeatureVector } from "./stress"; import { baselineScore } from "./baseline";
export function scenarioGrid(f:FeatureVector, shocks:number[]){return shocks.map(shock=>{const sf=stressFeatureVector(f,shock);const d=baselineScore(sf,[]);return {shock,featureVector:sf,decision:d}})}
