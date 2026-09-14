import {
  ArrowRight,
  Beaker,
  BookOpen,
  Coins,
  Database,
  Fingerprint,
  GitBranch,
  KeyRound,
  Landmark,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "wouter";

import { AttestcoinJudgePanel } from "@/components/attestcoin/AttestcoinJudgePanel";
import { AttestcoinTrace } from "@/components/attestcoin/AttestcoinTrace";
import { AtcEconomicsCard } from "@/components/attestcoin/AtcEconomicsCard";
import { MockJudgeSummaryCard } from "@/components/attestcoin/MockJudgeSummaryCard";
import { ProofBoundaryCard } from "@/components/attestcoin/ProofBoundaryCard";
import { PageShell } from "@/components/navigation/PageShell";

const topics = [
  {
    title: "Proof architecture",
    description:
      "Understand how source-chain information becomes typed verified facts.",
    icon: Fingerprint,
    href: "/evidence",
  },
  {
    title: "Readability",
    description:
      "Follow source-chain events through attestation, Merkle proofs, and Block Prover verification.",
    icon: Radio,
    href: "/readability",
  },
  {
    title: "Transaction proving",
    description:
      "Query a source transaction, separate Merkle inclusion from continuity, and keep the Block Prover behind an adapter.",
    icon: Fingerprint,
    href: "/transaction-proving",
  },
  {
    title: "Attestor settings",
    description:
      "Use the documented CC3 chain keys, release images, WebSocket RPCs, and AuthorizedOnly lifecycle without inventing boot nodes.",
    icon: KeyRound,
    href: "/attestor-settings",
  },
  {
    title: "DAO governance",
    description:
      "Govern RiskGuard, AI, Attestor, and ATC parameters behind a timelock. The DAO cannot mint evidence or disable RiskGuard.",
    icon: Landmark,
    href: "/governance",
  },
  {
    title: "Mock data & demo fallback",
    description:
      "Use explicit, labeled synthetic evidence and the 180-case extended catalog when demo mode is on. Live Attestcoin failures stay failed unless PROOFLOAN_DEMO_MODE is enabled.",
    icon: Beaker,
    href: "/demo",
  },
  {
    title: "AI mock lab",
    description:
      "Switch 22 deterministic AI interpretation scenarios, including explanations, confidence, what-if, and proof failures. Mock facts stay labeled and never replace Attestcoin or RiskGuard.",
    icon: Sparkles,
    href: "/ai-mock",
  },
  {
    title: "Underwriting",
    description:
      "Learn how the advisory AI layer creates features, confidence and reason codes.",
    icon: GitBranch,
    href: "/decisions",
  },
  {
    title: "AI × blockchain features",
    description:
      "Proof-aware wallet, graph, and freshness signals stay below the Attestcoin verification boundary and never replace RiskGuard.",
    icon: GitBranch,
    href: "/decisions",
  },
  {
    title: "RiskGuard",
    description:
      "See how deterministic policy rules bound the final action space.",
    icon: ShieldCheck,
    href: "/decisions",
  },
  {
    title: "ATC economics",
    description:
      "Reads stay free. Paid cross-chain actions consume ATC, reward operators, and burn a share.",
    icon: Coins,
    href: "/docs",
  },
  {
    title: "Attestor operator",
    description:
      "Review hot Attestor / cold Stash separation, AuthorizedOnly registration, and Idle → Waiting → Active readiness.",
    icon: Server,
    href: "/attestor-settings",
  },
  {
    title: "Persistence",
    description:
      "Explore applications, verified facts, decisions and offers.",
    icon: Database,
    href: "/applications",
  },
];

export default function Docs() {
  return (
    <PageShell
      eyebrow="Resources"
      title="Documentation"
      description="Explore the architecture, lifecycle and user-facing trust model behind ProofLoan."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map(topic => {
          const Icon = topic.icon;

          return (
            <Link
              key={topic.title}
              href={topic.href}
              className="pl-panel pl-panel-interactive group rounded-3xl p-6"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="mt-5 text-lg font-semibold text-white">
                {topic.title}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {topic.description}
              </p>

              <div className="mt-6 flex items-center text-xs font-medium text-cyan-300">
                Read section
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-6">
        <ProofBoundaryCard />
        <AtcEconomicsCard />
        <AttestcoinJudgePanel />
        <MockJudgeSummaryCard />
        <AttestcoinTrace />
      </div>

      <section className="pl-panel pl-panel-accent mt-6 p-6">
        <BookOpen className="h-5 w-5 text-cyan-300" />

        <h2 className="mt-5 text-xl font-semibold text-white">
          Trust boundary
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          ProofLoan deliberately separates evidence verification,
          inference, deterministic policy and execution. This navigation
          layer exposes that separation directly to users instead of
          hiding the lifecycle behind a single dashboard screen.
        </p>
      </section>
    </PageShell>
  );
}
