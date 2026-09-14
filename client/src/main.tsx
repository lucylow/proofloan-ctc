import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { isExpectedProofLoanError } from "@shared/proofloan";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { reportClientError } from "./lib/clientErrorReporter";
import { installHardenedQueryDefaults } from "@/hardening/queryDefaults";
import { normalizeAppError } from "@/hardening/appError";
import { recordErrorMetric } from "@/hardening/errorMetrics";
import { readClientEnvironment } from "@/hardening/environment";
import { resolveStorage, readJson } from "@/hardening/safeStorage";
import "./index.css";

const queryClient = new QueryClient();
installHardenedQueryDefaults(queryClient);

const isUnauthorized = (error: unknown) =>
  error instanceof TRPCClientError &&
  (error.message === UNAUTHED_ERR_MSG || error.data?.code === "UNAUTHORIZED");

const reportQueryFailure = (error: unknown, context: "query" | "mutation") => {
  if (isUnauthorized(error)) {
    if (typeof window !== "undefined") startLogin();
    return;
  }

  if (isExpectedProofLoanError(error)) return;

  const normalized = normalizeAppError(error, { source: context });
  recordErrorMetric(normalized);
  reportClientError(context, error);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    reportQueryFailure(event.query.state.error, "query");
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    reportQueryFailure(event.mutation.state.error, "mutation");
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const storage = resolveStorage("session");
          const rawResult = readJson<string>(storage, "manus-cookie", "");
          const raw = rawResult.ok ? rawResult.value : "";
          if (!raw) return {};
          const prefix = `${COOKIE_NAME}=`;
          const pair = raw.split(";").find(value => value.trim().startsWith(prefix));
          const token = pair?.trim().slice(prefix.length);
          return token ? { Authorization: `Bearer ${token}` } : {};
        } catch {
          return {};
        }
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).catch(error => {
          reportClientError("query", error);
          throw error;
        });
      },
    }),
  ],
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("ProofLoan root element was not found");
}

const environment = readClientEnvironment();
if (environment.mode === "development") {
  console.info("[ProofLoan] hardened client enabled", environment);
}

createRoot(root).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>,
);
