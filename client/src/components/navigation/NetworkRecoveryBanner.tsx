import { WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hardening/onlineStatus";

export function NetworkRecoveryBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="border-b border-amber-400/10 bg-amber-400/[0.04] px-4 py-2">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 text-[11px] text-amber-200 sm:px-2">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">Offline mode</span>
        <span className="hidden text-amber-200/60 sm:inline">New proof requests and wallet actions are paused.</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-amber-400/10 px-2 py-1 text-[10px] text-amber-200 hover:bg-amber-400/[0.06]"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    </div>
  );
}
