import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  activeSection: string;
  onSelectSection: (section: string) => void;
  onStart: () => void;
};

export function IntakeHeader({ activeSection, onSelectSection, onStart }: HeaderProps) {
  return (
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b12]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="#top" onClick={() => onSelectSection("top")} className="flex min-w-0 items-center gap-2 sm:gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl sm:h-9 sm:w-9 bg-cyan-300 text-slate-950 shadow-[0_0_32px_rgba(103,232,249,.4)]"><ShieldCheck size={20} /></div><div><div className="truncate font-black tracking-tight">ProofLoan</div><div className="hidden text-[10px] uppercase tracking-[0.24em] text-slate-500 sm:block">Creditcoin underwriting</div></div></a>
          <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex"><a href="/dashboard" className="transition hover:text-white">Workspace</a><a href="#how-it-works" className="transition hover:text-white">How it works</a><a href="#evidence" className="transition hover:text-white">Evidence</a><a href="#docs" className="transition hover:text-white">Docs</a></nav>
          <Button aria-label="Start a loan" onClick={onStart} className="h-11 shrink-0 rounded-full bg-cyan-300 px-3 text-xs font-bold text-slate-950 hover:bg-cyan-200 sm:px-5 sm:text-sm"><span className="sm:hidden">Start</span><span className="hidden sm:inline">Start a loan</span> <ArrowRight size={16} /></Button>
          </div><nav aria-label="Mobile section navigation" className="mobile-section-nav mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 text-[11px] text-slate-400 sm:px-6 md:hidden"><a href="/dashboard" className="shrink-0 rounded-full border border-white/10 px-3 py-2 transition hover:border-cyan-300/40 hover:text-cyan-200">Workspace</a><a aria-current={activeSection === "how" ? "page" : undefined} onClick={() => onSelectSection("how")} href="#how-it-works" className={`shrink-0 rounded-full border px-3 py-2 transition ${activeSection === "how" ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200" : "border-white/10 hover:border-cyan-300/40 hover:text-cyan-200"}`}>How it works</a><a aria-current={activeSection === "evidence" ? "page" : undefined} onClick={() => onSelectSection("evidence")} href="#evidence" className={`shrink-0 rounded-full border px-3 py-2 transition ${activeSection === "evidence" ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200" : "border-white/10 hover:border-cyan-300/40 hover:text-cyan-200"}`}>Evidence</a><a aria-current={activeSection === "docs" ? "page" : undefined} onClick={() => onSelectSection("docs")} href="#docs" className={`shrink-0 rounded-full border px-3 py-2 transition ${activeSection === "docs" ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200" : "border-white/10 hover:border-cyan-300/40 hover:text-cyan-200"}`}>Docs</a></nav>
      </header>
  );
}

export function IntakeOfflineNotice() {
  return (
    <div role="status" aria-live="assertive" className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
      <div className="font-semibold">You are offline</div>
      <p className="mt-1 text-amber-100/75">Proof requests and credit-file refreshes are paused until the connection returns. Your current form and displayed evidence remain available.</p>
    </div>
  );
}

export function IntakeFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-7 text-xs text-slate-500">
        <span>ProofLoan · built for BUIDL CTC 2026 Fall</span>
        <span>Attestcoin Protocol integration · Creditcoin testnet demo</span>
      </div>
    </footer>
  );
}
