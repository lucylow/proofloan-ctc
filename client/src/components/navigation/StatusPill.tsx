type StatusPillProps = {
  label: string;
  tone?: "cyan" | "green" | "amber" | "red" | "slate";
  live?: boolean;
};

const tones = {
  cyan: "bg-cyan-300/10 text-cyan-200 border-cyan-300/15",
  green: "bg-emerald-400/10 text-emerald-300 border-emerald-400/15",
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/15",
  red: "bg-rose-400/10 text-rose-300 border-rose-400/15",
  slate: "bg-white/[0.04] text-slate-400 border-white/[0.08]",
};

export function StatusPill({
  label,
  tone = "slate",
  live = false,
}: StatusPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
        tones[tone],
      ].join(" ")}
    >
      <span className={["pl-status-dot", live ? "pl-status-live" : ""].join(" ")} />
      {label}
    </span>
  );
}
