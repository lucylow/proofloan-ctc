import {
  Beaker,
  X,
} from "lucide-react";

import { useState } from "react";

import { useDemo } from "./DemoProvider";
import { MOCK_SCENARIO_LABELS } from "@/mock-attestcoin/constants";
import { isMockScenario } from "@/mock-attestcoin/scenarios";
import { resolveStorage, readJson, writeJson } from "@/hardening/safeStorage";

const DISMISS_KEY = "proofloan.demo.banner.dismissed";

export function DemoBanner() {
  const { scenario } = useDemo();
  const [dismissed, setDismissed] = useState(() => {
    const stored = readJson<boolean>(resolveStorage("session"), DISMISS_KEY, false);
    return stored.ok ? Boolean(stored.value) : false;
  });
  const label = isMockScenario(scenario)
    ? MOCK_SCENARIO_LABELS[scenario]
    : scenario;

  if (dismissed) {
    return null;
  }

  return (
    <div className="border-b border-cyan-300/10 bg-cyan-300/[0.05]">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Beaker className="h-3.5 w-3.5 shrink-0 text-cyan-300" />

        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
          Presentation only
        </span>

        <span className="hidden h-3 w-px bg-white/10 sm:block" />

        <span className="min-w-0 truncate text-[11px] text-slate-400">
          Scenario: {label}. Mock Attestcoin data never authorizes live proofs.
        </span>

        <button
          type="button"
          aria-label="Dismiss presentation banner"
          className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white"
          onClick={() => {
            setDismissed(true);
            writeJson(resolveStorage("session"), DISMISS_KEY, true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
