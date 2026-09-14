import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton({
  onRetry,
  pending = false,
  label = "Try again",
}: {
  onRetry: () => void | Promise<void>;
  pending?: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => void onRetry()}
      className="rounded-xl"
    >
      <RefreshCw className={pending ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
      {pending ? "Retrying…" : label}
    </Button>
  );
}
