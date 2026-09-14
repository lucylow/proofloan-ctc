import { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { reportClientError } from "@/lib/clientErrorReporter";

export class DemoErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportClientError("runtime", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.035] p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Demo data failed safely</div>
            <p className="mt-1 text-xs leading-5 text-slate-600">Only the demo panel was isolated. The DApp itself remains available.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => this.setState({ hasError: false })}
          className="mt-5 flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/[0.03]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset demo panel
        </button>
      </section>
    );
  }
}
