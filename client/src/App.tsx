import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { HardenedErrorBoundary } from "./components/HardenedErrorBoundary";
import { RouteRecoveryBoundary } from "./components/navigation/RouteRecoveryBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { HardenedDAppShell } from "./components/navigation/HardenedDAppShell";
import { HardenedDemoProvider } from "./demo/HardenedDemoProvider";
import { MockAttestcoinProvider } from "./mock-attestcoin/MockAttestcoinProvider";
import { STANDALONE_PATHS } from "./navigation/catalog";
import { getSectionLabel } from "./navigation/config";
import {
  APPLICATION_DETAIL_ROUTES,
  ApplicationDetail,
  Home,
  workspacePageRoutes,
  WorkspaceNotFound,
} from "./navigation/workspaceRoutes";
import NotFound from "./pages/NotFound";

function LoadingScreen() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="proofloan-app grid min-h-screen place-items-center px-6 text-center text-slate-100"
    >
      <div>
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,.35)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" />
        </div>
        <p className="text-lg font-extrabold tracking-tight">Loading ProofLoan</p>
        <p className="mt-2 text-sm text-slate-400">
          Preparing your verifiable credit workspace.
        </p>
        <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-cyan-300 pl-shimmer" />
        </div>
      </div>
    </main>
  );
}

function DAppRoutes() {
  const [location] = useLocation();

  if ((STANDALONE_PATHS as readonly string[]).includes(location)) {
    return (
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/intake" component={Home} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <HardenedDAppShell>
      <RouteRecoveryBoundary
        key={location}
        routeName={getSectionLabel(location)}
      >
        <Switch>
          {APPLICATION_DETAIL_ROUTES.map(path => (
            <Route key={path} path={path} component={ApplicationDetail} />
          ))}
          {workspacePageRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} component={Component} />
          ))}
          <Route component={WorkspaceNotFound} />
        </Switch>
      </RouteRecoveryBoundary>
    </HardenedDAppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" position="bottom-right" closeButton richColors />
          <MockAttestcoinProvider initialScenario="hero">
            <HardenedDemoProvider>
              <HardenedErrorBoundary>
                <Suspense fallback={<LoadingScreen />}>
                  <DAppRoutes />
                </Suspense>
              </HardenedErrorBoundary>
            </HardenedDemoProvider>
          </MockAttestcoinProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
