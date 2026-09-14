import {
  Clock3,
} from "lucide-react";

import {
  relativeTime,
} from "./useDemoClock";

export function DemoTimestamp({
  timestamp,
}: {
  timestamp: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-slate-700">
      <Clock3 className="h-3 w-3" />
      {relativeTime(timestamp)}
    </span>
  );
}
