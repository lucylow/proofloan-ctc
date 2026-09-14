export function AttestcoinProvenanceTable({
  facts,
}: {
  facts: Array<{
    id: string;
    eventType: string;
    sourceBlock: number;
    verificationBlock: number;
    proofRoot: string;
    sourceVerified: boolean;
  }>;
}) {
  return (
    <div className="max-w-full min-w-0 overflow-x-auto rounded-3xl border border-white/[0.07] bg-white/[0.025]">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-slate-700">
          <tr>
            <th className="px-5 py-4">Fact</th>
            <th className="px-5 py-4">Source block</th>
            <th className="px-5 py-4">Verified block</th>
            <th className="px-5 py-4">Proof root</th>
            <th className="px-5 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {facts.map(fact => (
            <tr key={fact.id} className="hover:bg-white/[0.02]">
              <td className="px-5 py-4">
                <div className="font-mono text-slate-300">
                  {fact.id}
                </div>
                <div className="mt-1 text-[10px] text-slate-700">
                  {fact.eventType}
                </div>
              </td>
              <td className="px-5 py-4 font-mono text-slate-500">
                {fact.sourceBlock}
              </td>
              <td className="px-5 py-4 font-mono text-slate-500">
                {fact.verificationBlock}
              </td>
              <td className="max-w-60 truncate px-5 py-4 font-mono text-[10px] text-slate-600">
                {fact.proofRoot}
              </td>
              <td className="px-5 py-4">
                <span
                  className={[
                    "rounded-full px-2 py-1 text-[10px]",
                    fact.sourceVerified
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-violet-400/10 text-violet-300",
                  ].join(" ")}
                >
                  {fact.sourceVerified ? "VERIFIED" : "PREVIEW"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
