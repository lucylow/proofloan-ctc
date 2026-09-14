import {
  ArrowRight,
  FileCheck2,
  LockKeyhole,
  Sparkles,
  Wallet,
} from "lucide-react";

import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/demo/DemoProvider";
import { useDappWallet } from "@/hooks/useDappWallet";
import {
  getApplicationNextStep,
  getApplicationStateMeta,
  isActiveApplicationState,
} from "@/navigation/applicationState";
import { isAddressShapedIdentity, isLiveChainWalletAddress, type SourceChain } from "@shared/proofloan";

const steps = [
  {
    number: "01",
    title: "Connect identity",
    description:
      "Provide a wallet or verified transaction reference so ProofLoan can identify the relevant evidence boundary.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Verify evidence",
    description:
      "Attestcoin evidence is decoded into typed verified facts rather than trusting raw RPC payloads.",
    icon: FileCheck2,
  },
  {
    number: "03",
    title: "Generate a decision",
    description:
      "The advisory underwriting layer produces bounded risk features and RiskGuard owns the allowable action space.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Review the offer",
    description:
      "Only a deterministic, policy-eligible offer can reach the acceptance surface.",
    icon: LockKeyhole,
  },
];

export default function Borrow() {
  const [, navigate] = useLocation();
  const { wallet } = useDappWallet();
  const { data } = useDemo();
  const [address, setAddress] = useState(wallet?.address ?? "");
  const [chain, setChain] = useState<SourceChain>("Ethereum Sepolia");

  useEffect(() => {
    if (wallet?.address) {
      setAddress(current => current || wallet.address);
    }
  }, [wallet?.address]);

  const continueApps = data.applications.filter(application =>
    isActiveApplicationState(application.state),
  );
  const addressHint =
    address.trim().length >= 8 &&
    isAddressShapedIdentity(address) &&
    !isLiveChainWalletAddress(address, chain)
      ? "This wallet address is not a valid EVM address for the selected chain."
      : undefined;

  const startLiveProof = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (address.trim()) {
      params.set("wallet", address.trim());
    }
    params.set("chain", chain);
    navigate(`/intake?${params.toString()}#apply`);
  };

  return (
    <PageShell
      eyebrow="Borrow"
      title="Start a verifiable credit application"
      description="Prove eligible on-chain history, then review a bounded offer without leaving the ProofLoan workspace."
      actions={
        <Button
          asChild
          variant="outline"
          className="rounded-xl"
        >
          <Link href="/docs">How it works</Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={startLiveProof}
          className="pl-panel pl-panel-accent overflow-hidden rounded-[28px] p-6 sm:p-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-medium text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Live Attestcoin proof
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Start from a wallet or source transaction.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Connected wallets are prefilled. You can still paste a preview identifier or continue into the official proof intake.
          </p>

          <label className="mt-6 block text-xs font-medium text-slate-300">
            Wallet address or preview identifier
            <input
              value={address}
              onChange={event => setAddress(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="0x… or preview identifier"
              className="mt-2 pl-field font-mono text-sm"
            />
          </label>
          {wallet?.address && address.trim() === wallet.address && (
            <p className="mt-2 text-xs text-emerald-300">
              Connected wallet prefilled. You can still paste another identity.
            </p>
          )}
          {address.trim().length >= 8 && addressHint && (
            <p role="status" className="mt-2 text-xs text-amber-200">
              {addressHint}
            </p>
          )}

          <fieldset className="mt-4">
            <legend className="text-xs font-medium text-slate-300">
              Source chain
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["Ethereum Sepolia", "Sepolia", "Testnet"],
                  ["Ethereum Mainnet", "Mainnet", "Production"],
                  ["Polygon Amoy", "Amoy", "Experimental"],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={chain === value}
                  onClick={() => setChain(value)}
                  className={["pl-chip", chain === value ? "is-active" : ""].join(" ")}
                >
                  <span className="text-sm font-semibold text-white">{label}</span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <Button
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200 sm:w-auto sm:px-6"
          >
            Continue to proof intake
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Next: Attestcoin verifies typed facts, then RiskGuard bounds any offer before Creditcoin execution.
          </p>
        </form>

        <div className="space-y-6">
          {continueApps.length > 0 && (
            <section className="pl-panel rounded-3xl p-5">
              <div className="text-sm font-semibold text-white">
                Continue an open application
              </div>
              <p className="mt-1 text-xs text-slate-400">
                These presentation records still need a borrower action.
              </p>
              <div className="mt-4 space-y-2">
                {continueApps.slice(0, 3).map(application => {
                  const meta = getApplicationStateMeta(application.state);
                  const nextStep = getApplicationNextStep(application);

                  return (
                    <Link
                      key={application.id}
                      href={nextStep.href}
                      className="pl-row flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] text-slate-400">
                          {application.id}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          ${application.amount.toLocaleString()} USDC
                        </div>
                      </div>
                      <StatusPill label={meta.label} tone={meta.tone} live />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section className="pl-panel rounded-3xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Typical lifecycle
            </div>

            <div className="mt-4 space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className={[
                      "flex gap-4 rounded-2xl border p-4",
                      index === 0
                        ? "border-cyan-300/25 bg-cyan-300/[0.06]"
                        : "border-white/[0.06] bg-white/[0.03]",
                    ].join(" ")}
                  >
                    <div className="pl-icon-well shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {step.number} · {step.title}
                        {index === 0 && (
                          <span className="ml-2 rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
                            You are here
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
