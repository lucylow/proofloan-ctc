import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hardening/onlineStatus";

export function OfflineNotice() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-3 py-2 text-xs text-amber-200">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Offline. Read-only screens remain available.</span>
    </div>
  );
}
