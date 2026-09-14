import { ShieldCheck } from "lucide-react";

export function ProtocolBadge({
  live = true,
}: {
  live?: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        live
          ? "border-cyan-300/10 bg-cyan-300/[0.05] text-cyan-200"
          : "border-violet-300/10 bg-violet-300/[0.05] text-violet-200",
      ].join(" ")}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {live ? "Attestcoin verified" : "Attestcoin preview"}
    </div>
  );
}
