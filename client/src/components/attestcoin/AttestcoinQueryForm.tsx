import { useState } from "react";
import { ArrowRight, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttestcoinProof } from "@/attestcoin/useAttestcoinProof";
import type { AttestcoinProofBundle, AttestcoinSourceChain } from "@shared/attestcoin";
import {
  ATTESTCOIN_SOURCE_CHAIN_NAMES,
  getSourceChainRecord,
} from "@shared/multichain";
import { ProofProgress } from "./ProofProgress";
import { VerifiedFactCard } from "./VerifiedFactCard";
import { ProtocolBadge } from "./ProtocolBadge";

export function AttestcoinQueryForm({
  onComplete,
}: {
  onComplete?: (result: AttestcoinProofBundle) => void;
}) {
  const [txHash, setTxHash] = useState("");
  const [sourceChain, setSourceChain] = useState<AttestcoinSourceChain>(
    "Ethereum Sepolia",
  );
  const [bundle, setBundle] = useState<AttestcoinProofBundle | null>(null);

  const proof = useAttestcoinProof();
  const selected = getSourceChainRecord(sourceChain);

  const submit = async () => {
    try {
      const result = await proof.run({
        txHash,
        sourceChain,
      });
      setBundle(result);
      onComplete?.(result);
    } catch {
      setBundle(null);
    }
  };

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10">
          <FileSearch className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            Prove a source-chain transaction
          </div>
          <div className="mt-1 text-xs leading-5 text-slate-600">
            Live proofs follow the Attestcoin environment registry. Official CC3 Testnet chains are Ethereum Sepolia (chainkey 1) and Ethereum Mainnet (chainkey 3). Polygon Amoy remains preview-only.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[220px_1fr_auto]">
        <select
          value={sourceChain}
          onChange={event =>
            setSourceChain(
              event.target.value as AttestcoinSourceChain,
            )
          }
          className="h-11 rounded-xl border border-white/10 bg-black/10 px-3 text-xs text-slate-300 outline-none"
        >
          {ATTESTCOIN_SOURCE_CHAIN_NAMES.map(chain => {
            const record = getSourceChainRecord(chain);
            return (
              <option key={chain} value={chain}>
                {record.support === "experimental"
                  ? `${chain} (experimental)`
                  : chain}
              </option>
            );
          })}
        </select>

        <Input
          value={txHash}
          onChange={event => setTxHash(event.target.value)}
          placeholder="0x + 64 hexadecimal characters"
          className="h-11 rounded-xl border-white/10 bg-black/10 font-mono text-xs"
        />

        <Button
          onClick={submit}
          disabled={proof.isPending}
          className="h-11 rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          Prove
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>

      {selected.support === "experimental" && (
        <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-3 text-xs text-amber-200">
          {selected.name} has no official Attestcoin chainkey. A live proof request is rejected; use preview or an officially listed chain.
        </div>
      )}

      <div className="mt-4">
        <ProofProgress progress={proof.progress} />
      </div>

      {bundle && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ProtocolBadge live={bundle.receipt.verified && bundle.receipt.mode !== "preview"} />
            <div className="font-mono text-[10px] text-slate-600">
              {bundle.receipt.sourceChain} · block {bundle.receipt.sourceBlock} → Creditcoin {bundle.receipt.verificationBlock}
            </div>
          </div>
          {bundle.receipt.warnings.map(warning => (
            <div key={warning} className="rounded-xl border border-violet-400/10 bg-violet-400/[0.04] p-3 text-xs text-violet-200">
              {warning}
            </div>
          ))}
          {bundle.facts.map(fact => (
            <VerifiedFactCard key={fact.id} fact={fact} />
          ))}
        </div>
      )}
    </section>
  );
}
