import { Component, ReactNode } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { reportClientError } from "@/lib/clientErrorReporter";

export class RouteRecoveryBoundary extends Component<
  { children: ReactNode; routeName?: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    reportClientError("runtime", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main role="alert" className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-400/10">
          <AlertTriangle className="h-6 w-6 text-rose-300" />
        </div>
        <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">Route recovery</div>
        <h1 className="mt-2 text-xl font-bold text-white">This screen could not render.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{this.props.routeName ?? "The current route"} hit a recoverable UI error. Other routes remain available.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/20 px-4 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/[0.05]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 hover:bg-cyan-200">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </main>
    );
  }
}
