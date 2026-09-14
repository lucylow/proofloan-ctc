import { Activity, HardDrive, ShieldCheck, Wifi } from "lucide-react";
import { readClientEnvironment } from "@/hardening/environment";
import { checkStorageHealth } from "@/hardening/storageHealth";
import { useOnlineStatus } from "@/hardening/onlineStatus";

export function DiagnosticsCard() {
  const environment = readClientEnvironment();
  const storage = checkStorageHealth();
  const online = useOnlineStatus();

  const rows = [
    ["Network", online ? "Online" : "Offline", Wifi],
    ["Storage", storage.local && storage.session ? "Ready" : "Limited", HardDrive],
    ["Crypto", environment.hasCrypto ? "Available" : "Unavailable", ShieldCheck],
    ["Fetch", environment.hasFetch ? "Available" : "Unavailable", Activity],
  ] as const;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="text-sm font-semibold text-white">Client diagnostics</div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value, Icon]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
            <Icon className="h-4 w-4 text-cyan-300" />
            <div className="flex-1 text-xs text-slate-500">{label}</div>
            <div className="text-xs font-medium text-slate-300">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
