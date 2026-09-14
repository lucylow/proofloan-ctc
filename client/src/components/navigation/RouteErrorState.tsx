import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function RouteErrorState({
  title = "This page could not load",
  message = "The interface encountered a recoverable error.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10">
        <AlertTriangle className="h-6 w-6 text-amber-300" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 rounded-xl"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
