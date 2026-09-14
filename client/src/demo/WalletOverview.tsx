import {
  CheckCircle2,
  Copy,
  Wallet,
} from "lucide-react";

import { toast } from "sonner";

import { useDemo } from "./DemoProvider";

export function WalletOverview() {
  const { data } = useDemo();

  const wallet =
    data.wallets.find(
      item => item.connected,
    ) ?? data.wallets[0];

  if (!wallet) {
    return null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        wallet.address,
      );

      toast.success(
        "Demo wallet address copied.",
      );
    } catch {
      toast.error(
        "Unable to copy the demo address.",
      );
    }
  };

  return (
    <section className="pl-panel rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="pl-icon-well">
          <Wallet className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="text-sm font-semibold text-white">
            {wallet.label}
          </div>

          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-slate-500">
            {wallet.address.slice(0, 8)}…
            {wallet.address.slice(-6)}

            {wallet.verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        <button
          onClick={copy}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
          aria-label="Copy address"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Native
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {wallet.nativeBalance}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Stablecoin
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {wallet.stablecoinBalance}
          </div>
        </div>
      </div>
    </section>
  );
}
