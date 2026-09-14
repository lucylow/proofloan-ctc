import { RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMobileErrorNoticeModel } from "@/lib/mobileErrorNotice";

export function MobileErrorNotice({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: { message: string };
  onRetry?: () => void;
}) {
  const notice = getMobileErrorNoticeModel(error.message, Boolean(onRetry));

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mobile-error-notice rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-200"
    >
      <div className="flex items-start gap-2">
        <X size={15} className="mt-0.5 shrink-0 text-rose-300" />
        <div className="min-w-0">
          <div className="font-semibold">
            {title}{" "}
            <span className="ml-1 font-mono text-[10px] text-rose-300/70">
              {notice.code}
            </span>
          </div>
          <p className="mt-1 break-words">{notice.message}</p>
          <p className="mt-2 text-[11px] leading-5 text-rose-200/70">
            {notice.guidance}
          </p>
          {notice.canRetry && (
            <Button
              type="button"
              variant="outline"
              aria-label={notice.actionLabel}
              onClick={onRetry}
              className="mt-3 min-h-10 rounded-lg border-rose-300/25 px-3 text-xs text-rose-100 hover:bg-rose-400/10"
            >
              <RotateCcw size={13} /> {notice.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
