import { AlertTriangle, ExternalLink } from "lucide-react";
import { useDemo } from "@/demo/DemoProvider";
import { useDappWallet } from "@/hooks/useDappWallet";
import { Button } from "@/components/ui/button";

export function WalletRecoveryNotice() {
  const { scenario } = useDemo();
  const { state, error, connect, switchToSepolia } = useDappWallet();

  const shouldShow = state === "error" || state === "wrong-network" || scenario === "risk-warning";
  if (!shouldShow) return null;

  return (
    <section className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.035] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">
            {state === "wrong-network" ? "Unsupported network" : "Wallet recovery"}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {state === "wrong-network"
              ? "Switch networks before attempting a blockchain action."
              : error ?? "The wallet connection needs attention."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state === "wrong-network" ? (
              <Button onClick={switchToSepolia} variant="outline" className="rounded-xl">
                Switch network
              </Button>
            ) : (
              <Button onClick={connect} variant="outline" className="rounded-xl">
                Reconnect wallet
              </Button>
            )}
            <Button asChild variant="ghost" className="rounded-xl text-slate-400">
              <a href="/docs" className="inline-flex items-center gap-2">
                Wallet guide
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
