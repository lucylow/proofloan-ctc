import {
  Check,
  Monitor,
  Palette,
  Search,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

import { PageShell } from "@/components/navigation/PageShell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { AttestcoinHealthCard } from "@/components/attestcoin/AttestcoinHealthCard";
import { AtcEconomicsCard } from "@/components/attestcoin/AtcEconomicsCard";
import { OperatorDiagnosticsCard } from "@/components/attestcoin/OperatorDiagnosticsCard";
import { trpc } from "@/lib/trpc";
import { useDemo } from "@/demo/DemoProvider";
import { DemoDebugPanel } from "@/demo/DemoDebugPanel";
import { DiagnosticsCard } from "@/components/navigation/DiagnosticsCard";
import { DataHealthPanel } from "@/components/navigation/DataHealthPanel";
import {
  resetNavigationPreferences,
  useNavigationPreferences,
} from "@/navigation/useNavigationPreferences";
import { listMockScenarios } from "@/mock-attestcoin/scenarios";
import { MockHealthStrip } from "@/components/attestcoin/MockHealthStrip";
import type { DemoScenario } from "@/demo/types";

export default function Settings() {
  const {
    preferences,
    setCompactMode,
    setCommandPaletteEnabled,
    setAnimationsEnabled,
  } = useNavigationPreferences();
  const {
    scenario,
    setScenario,
    data,
  } = useDemo();
  const healthQuery = trpc.attestcoin.status.useQuery({
    sourceChain: "Ethereum Sepolia",
  }, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return (
    <PageShell
      eyebrow="Resources"
      title="Settings"
      description="Tune the ProofLoan interface without changing the financial state or evidence lifecycle."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="pl-panel rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
              <Palette className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Interface
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Control the navigation density and interaction experience.
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <SettingRow
              icon={Monitor}
              title="Compact navigation"
              description="Reduce spacing in dense desktop layouts."
              checked={preferences.compactMode}
              onCheckedChange={setCompactMode}
            />

            <Separator className="bg-white/[0.06]" />

            <SettingRow
              icon={Search}
              title="Command palette"
              description="Enable ⌘K / Ctrl+K navigation search."
              checked={preferences.commandPaletteEnabled}
              onCheckedChange={setCommandPaletteEnabled}
            />

            <Separator className="bg-white/[0.06]" />

            <SettingRow
              icon={SlidersHorizontal}
              title="Motion effects"
              description="Enable route and control transitions."
              checked={preferences.animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </section>

        <section className="pl-panel rounded-3xl p-6">
          <div className="text-sm font-semibold text-white">
            Presentation scenario
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Switch the seeded Attestcoin mock dataset. This is presentation-only and never authorizes a live proof.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {listMockScenarios().map(option => (
              <button
                key={option.value}
                onClick={() =>
                  setScenario(option.value as DemoScenario)
                }
                className={[
                  "rounded-xl border p-3 text-left text-xs transition-colors",
                  scenario === option.value
                    ? "border-violet-300/20 bg-violet-300/10 text-violet-200"
                    : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-white",
                ].join(" ")}
              >
                <div>{option.label}</div>
                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </section>

        <MockHealthStrip />

        <AttestcoinHealthCard health={healthQuery.data} />
        <OperatorDiagnosticsCard />
        <AtcEconomicsCard />

        <DemoDebugPanel />

        <DataHealthPanel data={data} />
        <DiagnosticsCard />

        <section className="pl-panel rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10">
              <Shield className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <div className="text-sm font-semibold text-white">
                Safety & recovery
              </div>

              <div className="mt-1 text-xs leading-5 text-slate-600">
                Client-side UI state should never be treated as authorization
                or financial truth.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 text-emerald-300" />

              <div className="text-xs leading-5 text-slate-400">
                Navigation preferences are local-only. Financial data,
                proof verification, underwriting, policy evaluation and
                transaction execution remain server-side responsibilities.
                Demo records are presentation-only.
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6 rounded-xl"
            onClick={() => {
              resetNavigationPreferences();
              window.location.reload();
            }}
          >
            Reset navigation preferences
          </Button>
        </section>
      </div>
    </PageShell>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Monitor;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.03]">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-slate-600">
          {description}
        </div>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
