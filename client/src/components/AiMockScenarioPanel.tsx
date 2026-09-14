import { AI_MOCK_SCENARIO_IDS, isAiMockScenarioId } from "@/lib/aiMockData";
import type { AiDashboardSnapshot } from "@shared/aiMockTypes";

type Props = {
  snapshot?: AiDashboardSnapshot;
  selectedScenarioId?: string;
  onScenarioChange?: (id: string) => void;
};

export function AiMockScenarioPanel({ snapshot, selectedScenarioId, onScenarioChange }: Props) {
  const candidate = selectedScenarioId ?? snapshot?.scenarioId ?? "hero";
  const selected = isAiMockScenarioId(candidate) ? candidate : "hero";

  return (
    <section className="pl-panel rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            AI mock lab
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Scenario-driven underwriting evidence
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Advisory mock interpretation only. RiskGuard and Attestcoin remain the policy and evidence boundaries.
          </p>
        </div>
        <label className="block min-w-[220px] text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Scenario
          <select
            value={selected}
            onChange={event => onScenarioChange?.(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b121d] px-3 py-2 text-sm font-medium normal-case tracking-normal text-white"
          >
            {AI_MOCK_SCENARIO_IDS.map(id => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      </div>
      {snapshot ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Recommendation" value={snapshot.recommendation} />
          <Metric label="Risk tier" value={snapshot.scenario.decision.riskTier} />
          <Metric label="Confidence" value={`${Math.round(snapshot.scenario.decision.confidence * 100)}%`} />
          <Metric label="Evidence" value={String(snapshot.scenario.features.evidenceCount)} />
        </div>
      ) : (
        <p className="text-sm text-slate-400">Select a mock scenario to populate AI interpretation data.</p>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}
