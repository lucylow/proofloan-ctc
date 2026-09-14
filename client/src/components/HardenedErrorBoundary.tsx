import { Component, Fragment, ReactNode } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { reportClientError } from "@/lib/clientErrorReporter";
import { getNextRetryKey, getRuntimeErrorMessage } from "@/components/ErrorBoundary";

export class HardenedErrorBoundary extends Component<
  { children: ReactNode; resetOnRouteChange?: boolean },
  { hasError: boolean; error: Error | null; retryKey: number }
> {
  state = { hasError: false, error: null as Error | null, retryKey: 0 };
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportClientError("runtime", error, info.componentStack);
  }

  componentWillUnmount() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  reset = () => {
    this.setState(previous => ({
      hasError: false,
      error: null,
      retryKey: getNextRetryKey(previous.retryKey),
    }));
  };

  render() {
    if (!this.state.hasError) {
      return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
    }

    return (
      <main role="alert" aria-live="assertive" className="grid min-h-screen place-items-center bg-[#070b12] px-4 py-8 text-slate-100">
        <section className="w-full max-w-xl rounded-3xl border border-rose-300/10 bg-[#0b121d] p-6 shadow-2xl shadow-black/30">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-400/10">
              <AlertTriangle className="h-5 w-5 text-rose-300" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Recoverable application error</div>
              <h1 className="mt-2 text-xl font-bold text-white">This screen stopped safely.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">The rest of ProofLoan remains isolated from this component failure.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4 font-mono text-[11px] leading-5 text-slate-600">
            {getRuntimeErrorMessage(this.state.error)}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={this.reset} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/20 px-4 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/[0.05]">
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 hover:bg-cyan-200">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
