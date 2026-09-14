import type { AiEvaluationCase } from "./aiTypes"; import { evaluateCases } from "./evaluation";
export function runBacktest(cases:AiEvaluationCase[]){return evaluateCases(cases);}
