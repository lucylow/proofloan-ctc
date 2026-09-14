import {
  Beaker,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import { useDemo } from "./DemoProvider";
import { listMockScenarios } from "@/mock-attestcoin/scenarios";
import type { DemoScenario } from "./types";
import { Button } from "@/components/ui/button";

export function DemoControlPanel() {
  const {
    scenario,
    setScenario,
    reset,
  } = useDemo();

  if (
    typeof window !== "undefined" &&
    !window.location.search.includes(
      "demo",
    )
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-[150] w-[min(92vw,360px)] rounded-2xl border border-violet-400/20 bg-[#0d0b16]/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-400/10">
          <Beaker className="h-4 w-4 text-violet-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-300">
            Demo controls
          </div>

          <div className="mt-1 text-[11px] text-slate-600">
            Presentation data only · live prove path unchanged
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={reset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-4">
        <select
          value={scenario}
          onChange={event =>
            setScenario(
              event.target
                .value as DemoScenario,
            )
          }
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-300 outline-none"
        >
          {listMockScenarios().map(option => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0b121d]"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-600">
        <ChevronDown className="h-3 w-3" />
        Add <code>?demo</code> to the URL to keep this panel visible.
      </div>
    </div>
  );
}
