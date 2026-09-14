import { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

export function ActionGuard({
  allowed,
  message,
  children,
}: {
  allowed: boolean;
  message?: string;
  children: ReactNode;
}) {
  if (allowed) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 grid place-items-center rounded-xl bg-[#070b12]/50 backdrop-blur-[1px]">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b121d] px-3 py-2 text-[10px] text-slate-400 shadow-xl">
          <LockKeyhole className="h-3 w-3" />
          {message ?? "Unavailable"}
        </div>
      </div>
    </div>
  );
}
