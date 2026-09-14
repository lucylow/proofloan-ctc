import type { AiEvaluationCase, AiEvaluationReport } from "./aiTypes";
import { baselineScore } from "./baseline";

export function evaluateCases(cases: AiEvaluationCase[]): AiEvaluationReport {
  const results = cases.map(c => { const d = baselineScore(c.features, []); const tierOk = d.riskTier === c.expectedRiskTier; const pdOk = d.pd30 <= c.expectedPd30Max; const reasonOk = !c.expectedReasons || c.expectedReasons.every(r => d.reasonCodes.includes(r as never)); return { id: c.id, passed: tierOk && pdOk && reasonOk, detail: `tier=${d.riskTier}, pd30=${d.pd30.toFixed(4)}, reasons=${d.reasonCodes.join(",")}` }; });
  const passed = results.filter(r => r.passed).length; return { passed, failed: results.length - passed, score: results.length ? passed / results.length : 1, cases: results };
}
