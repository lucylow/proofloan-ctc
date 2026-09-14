import { Clock3 } from "lucide-react";

export function StaleDataNotice({
  label = "Showing cached data",
  onRefresh,
}: {
  label?: string;
  onRefresh?: () => void | Promise<void>;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] px-3 py-2 text-[11px] text-amber-200/80">
      <Clock3 className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
      {onRefresh && (
        <button type="button" onClick={() => void onRefresh()} className="ml-auto font-semibold text-amber-200 hover:text-white">
          Refresh
        </button>
      )}
    </div>
  );
}
