import { ArrowRight, Check, CircleDot, ExternalLink, FileCheck2, LockKeyhole, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function IntakeHero({ onStart }: { onStart: () => void }) {
  return (
        <section className="grid gap-10 py-14 sm:gap-12 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <div><Badge className="mb-6 border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">ATTESTCOIN PROTOCOL × CREDITCOIN</Badge><h1 className="max-w-3xl text-[2.75rem] font-black leading-[.98] tracking-[-.055em] text-white sm:text-7xl">Credit that starts with <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-400 bg-clip-text text-transparent">proof.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:mt-7 sm:text-lg sm:leading-8">ProofLoan turns verified cross-chain behavior into a bounded credit decision. Every fact, model output, policy check, and Creditcoin execution is visible in one auditable trail.</p><div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4"><Button onClick={onStart} className="h-12 w-full rounded-full bg-cyan-300 px-6 font-bold text-slate-950 hover:bg-cyan-200 sm:w-auto">Prove my history <ArrowRight size={18} /></Button><a href="#how-it-works" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/5 sm:w-auto">See the trust boundary</a></div><div className="mt-8 flex flex-wrap gap-x-4 gap-y-3 text-xs text-slate-500 sm:mt-10 sm:gap-5"><span className="flex items-center gap-2"><LockKeyhole size={14} className="text-cyan-300" /> No opaque oracle</span><span className="flex items-center gap-2"><FileCheck2 size={14} className="text-cyan-300" /> Typed evidence</span><span className="flex items-center gap-2"><Sparkles size={14} className="text-cyan-300" /> AI advisory, not signer</span></div></div>
          <div className="mobile-trace relative overflow-hidden rounded-[1.5rem] border border-cyan-300/15 bg-[#0b121d]/80 p-3 sm:rounded-[2rem] sm:p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" /><div className="relative rounded-2xl border border-white/10 bg-[#0d1622]/90 p-4 sm:rounded-3xl sm:p-6"><div className="flex items-center justify-between"><span className="max-w-[10rem] text-[10px] uppercase tracking-[.18em] text-slate-500 sm:max-w-none sm:text-xs sm:tracking-[.22em]">Live underwriting trace</span><span className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Testnet ready</span></div><div className="mt-8 space-y-4"><TraceRow label="Source transaction" value="Ethereum Sepolia" done /><TraceRow label="Attestcoin proof" value="VerifiedFact · 3 records" done /><TraceRow label="AI decision" value="Risk tier B · 92% confidence" done /><TraceRow label="RiskGuard" value="Offer within bounds" done /></div><div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4"><div className="text-xs text-slate-500">Indicative offer</div><div className="mt-1 flex items-baseline justify-between"><span className="text-3xl font-black text-white sm:text-4xl">1,500 <small className="text-base text-slate-400">USDC</small></span><span className="text-right text-sm font-semibold text-cyan-200">11.5% APR<br /><span className="text-xs font-normal text-slate-500">90 day term</span></span></div></div></div></div>
        </section>
  );
}

export function IntakeHowItWorks() {
  return (
        <section id="how-it-works" className="scroll-mt-24 border-t border-white/10 py-16"><div className="mb-9 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-300">One bounded loop</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Evidence → inference → policy → execution.</h2></div><div className="grid gap-4 md:grid-cols-4">{[["01", "Prove", "The Attestcoin proof worker returns verified, typed facts from a source chain."], ["02", "Score", "A server-side model builds a FeatureVector and produces calibrated PD plus reasons."], ["03", "Guard", "RiskGuard deterministically checks amount, LTV, rate, freshness, confidence, and liquidity."], ["04", "Execute", "Only an accepted, bounded offer crosses the Creditcoin testnet execution boundary."]].map(([n, title, body]) => <div key={n} className="pl-panel pl-panel-interactive rounded-3xl p-5"><div className="text-xs font-bold text-cyan-300">{n}</div><h3 className="mt-8 text-xl font-bold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{body}</p></div>)}</div></section>
  );
}

export function IntakeDocs() {
  return (
    <section id="docs" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-300">Technical docs</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">The trust boundary is the product.</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-400">
            ProofLoan keeps evidence, inference, policy, and execution separate. The AI can be wrong without gaining authority to move funds; the Attestcoin proof worker can be unavailable without silently turning raw RPC into truth.
          </p>
          <a
            href="https://docs.creditcoin.org/attestcoin-protocol/dapp-builder-infrastructure/attestcoin-sdk-usc-sdk.md"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
          >
            Read Attestcoin Protocol USC SDK docs <ExternalLink size={15} />
          </a>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#0b121d] p-5">
          <pre className="overflow-x-auto text-sm leading-7 text-slate-400">
            <span className="text-cyan-300">SourceTransaction</span>
            {"  →  "}
            <span className="text-emerald-300">VerifiedFact</span>
            {"  →  "}
            <span className="text-purple-300">FeatureVector</span>
            {"  →  "}
            <span className="text-amber-300">Decision</span>
            {"  →  "}
            <span className="text-pink-300">Offer</span>
            {"  →  "}
            <span className="text-cyan-300">Creditcoin Loan</span>
            {"\n\n"}
            <span className="text-slate-500">USC verifier</span>
            {"       evidence authority\n"}
            <span className="text-slate-500">AI model</span>
            {"          advisory inference\n"}
            <span className="text-slate-500">RiskGuard</span>
            {"         deterministic policy\n"}
            <span className="text-slate-500">LoanPool</span>
            {"         bounded execution"}
          </pre>
        </div>
      </div>
    </section>
  );
}

function TraceRow({ label, value, done }: { label: string; value: string; done?: boolean }) { return <div className="mobile-trace-row flex items-center gap-3"><div className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-slate-500"}`}>{done ? <Check size={15} /> : <CircleDot size={15} />}</div><div className="flex-1"><div className="text-sm text-slate-300">{label}</div><div className="text-xs text-slate-500">{value}</div></div></div>; }
