import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useRetryableAction } from "@/hardening/useRetryableAction";

export function SafeActionButton({
  action,
  children,
  disabled,
}: {
  action: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}) {
  const retry = useRetryableAction(action, { maxAttempts: 2, baseDelayMs: 300, maxDelayMs: 1000, jitterRatio: 0.1 });

  return (
    <div>
      <Button
        type="button"
        disabled={disabled || retry.pending}
        onClick={() => void retry.run()}
        className="rounded-xl"
      >
        {retry.pending ? "Working…" : children}
      </Button>
      {retry.error && (
        <div className="mt-2 text-[10px] text-rose-300" role="alert">
          {retry.error.userMessage}
        </div>
      )}
    </div>
  );
}
