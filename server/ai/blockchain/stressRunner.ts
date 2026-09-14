import type { StressScenario } from './stressScenarios';
export function runStressScenarios(base:Record<string,number>,scenarios:StressScenario[]){ return scenarios.map(s=>({scenario:s.name,features:s.mutate({...base})})); }
