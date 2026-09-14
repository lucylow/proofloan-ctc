import {
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toAttestcoinFacts } from "@/attestcoin/fromDemo";
import { AttestcoinHealthCard } from "@/components/attestcoin/AttestcoinHealthCard";
import { AtcEconomicsCard } from "@/components/attestcoin/AtcEconomicsCard";
import { AttestcoinJudgePanel } from "@/components/attestcoin/AttestcoinJudgePanel";
import { AttestcoinQueryForm } from "@/components/attestcoin/AttestcoinQueryForm";
import { AttestcoinTrace } from "@/components/attestcoin/AttestcoinTrace";
import { CrossChainCoverage } from "@/components/attestcoin/CrossChainCoverage";
import { MockCrossChainCoverage } from "@/components/attestcoin/MockCrossChainCoverage";
import { ProofBoundaryCard } from "@/components/attestcoin/ProofBoundaryCard";
import { trpc } from "@/lib/trpc";
import { useDemo } from "@/demo/DemoProvider";
import { useOptionalMockAttestcoin } from "@/mock-attestcoin/hooks";
import { money, shortenHash } from "@/demo/utils";

function freshnessClass(freshness: string) {
  if (freshness === "Fresh") {
    return "border-emerald-400/10 bg-emerald-400/10 text-emerald-300";
  }

  if (freshness === "Stale") {
    return "border-rose-400/10 bg-rose-400/10 text-rose-300";
  }

  return "border-amber-400/10 bg-amber-400/10 text-amber-300";
}

export default function Evidence() {
  const { data } = useDemo();
  const mock = useOptionalMockAttestcoin();
  const evidence = data.evidence;
  const [query, setQuery] = useState("");
  const facts = useMemo(() => toAttestcoinFacts(evidence), [evidence]);
  const healthQuery = trpc.attestcoin.status.useQuery({
    sourceChain: "Ethereum Sepolia",
  }, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return evidence.filter(item => {
      if (!normalized) {
        return true;
      }

      return [
        item.id,
        item.chain,
        item.type,
        item.applicationId,
        item.amount,
        item.sourceTransaction,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [evidence, query]);

  return (
    <PageShell
      eyebrow="Credit"
      title="Evidence explorer"
      description="Inspect the typed verified facts that form the evidence boundary for ProofLoan underwriting."
    >
      <div className="space-y-6">
      <ProofBoundaryCard />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AttestcoinQueryForm />
        <div className="space-y-6">
          <AttestcoinHealthCard health={healthQuery.data} />
          <AtcEconomicsCard />
          <AttestcoinTrace current={healthQuery.data ? 4 : 0} />
        </div>
      </div>
      {mock ? (
        <MockCrossChainCoverage dataset={mock.dataset} />
      ) : (
        <CrossChainCoverage facts={facts} />
      )}
      <div className="pl-panel rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              Verified facts
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {query.trim()
                ? `${filtered.length} of ${evidence.length} facts match “${query.trim()}”`
                : "Raw chain payloads are not treated as financial truth."}
            </div>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search evidence"
              className="h-10 rounded-xl border-white/10 bg-black/10 pl-10"
            />
          </div>
        </div>

        {evidence.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-slate-700" />
            <div className="mt-3 text-sm text-slate-500">
              No evidence records in this demo scenario.
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Fact</th>
                    <th className="px-5 py-3 font-medium">Chain</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Freshness</th>
                    <th className="px-5 py-3 font-medium">Block</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.05]">
                  {filtered.map(item => (
                    <tr
                      key={item.id}
                    className="transition-colors hover:bg-cyan-300/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="pl-icon-well h-9 w-9">
                            <FileCheck2 className="h-4 w-4 text-cyan-300" />
                          </div>

                          <div>
                            <div className="font-mono text-xs text-slate-300">
                              {item.id}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <Link
                                href={`/applications/${item.applicationId}/evidence`}
                                className="rounded-full bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-cyan-300 hover:bg-cyan-300/10"
                              >
                                {item.applicationId}
                              </Link>
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-700">
                              <ExternalLink className="h-3 w-3" />
                              {shortenHash(item.sourceTransaction)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {item.chain}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-400">
                          {item.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-white">
                        {item.amount != null
                          ? money(item.amount, item.currency)
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <Badge className={freshnessClass(item.freshness)}>
                          {item.freshness}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {item.blockNumber.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.05] md:hidden">
              {filtered.map(item => (
                <div key={item.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10">
                      <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs text-slate-300">
                        {item.id}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500">
                          {item.chain}
                        </span>

                        <span className="rounded-full bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-500">
                          {item.type}
                        </span>

                        <Link
                          href={`/applications/${item.applicationId}/evidence`}
                          className="rounded-full bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-cyan-300"
                        >
                          {item.applicationId}
                        </Link>
                      </div>
                    </div>

                    <Badge className={freshnessClass(item.freshness)}>
                      {item.freshness}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Event
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-300">
                        {item.type}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Amount
                      </div>
                      <div className="mt-1 text-xs text-white">
                        {item.amount != null
                          ? money(item.amount, item.currency)
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Verification
                      </div>

                      <div className="mt-1 text-xs text-slate-300">
                        {item.verified ? "Verified" : "Needs review"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">
                        Confidence
                      </div>

                      <div className="mt-1 text-xs text-slate-300">
                        {item.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-700">
                    <span>Block {item.blockNumber.toLocaleString()}</span>
                    <span>{shortenHash(item.sourceTransaction)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && evidence.length > 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-slate-700" />
            <div className="mt-3 text-sm text-slate-500">
              No evidence matches your search.
            </div>
          </div>
        )}
      </div>
      <AttestcoinJudgePanel />
      </div>
    </PageShell>
  );
}
