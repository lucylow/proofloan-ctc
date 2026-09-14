# ProofLoan 100+ Page-Scale Error Hardening Pack

This pack assumes the DApp navigation + demo data layer from the preceding implementation is already present.

## What it hardens

- React runtime failures
- Per-route failures
- Demo-provider failures
- Corrupted local/session storage
- Invalid demo records
- Orphaned evidence/decision/offer references
- Offline transitions
- Network timeouts
- Bounded retries with jitter
- Duplicate requests
- Stale asynchronous responses
- Aborted asynchronous requests
- Wallet provider absence
- Wallet rejection
- Wallet disconnects
- Unsupported networks
- EIP-1193 event cleanup
- Query retry policy
- Mutation retry policy
- Navigation allowlisting
- External-link sanitization
- Clipboard failure
- JSON parsing failure
- Date parsing failure
- Numeric parsing failure
- Transaction hash validation
- Idempotency keys
- Action serialization
- Circuit breaking
- TTL caching
- Polling backoff
- Visibility-aware polling
- Telemetry buffering
- Client diagnostics
- Demo scenario persistence
- Demo state recovery

## Installation

Copy the `client/src` tree into the project while preserving the existing project files.

Recommended import aliases:

```ts
import { normalizeAppError } from "@/hardening/appError";
import { useOnlineStatus } from "@/hardening/onlineStatus";
import { useHardenedDappWallet } from "@/hooks/useHardenedDappWallet";
```

## App integration

Use `App.hardened.tsx` as the reference implementation. Either rename it to `App.tsx`, or copy the providers/wrappers into the current App.

At the outermost level keep the existing ErrorBoundary because the original project already has production-oriented recovery behavior.

Inside it add:

```tsx
<HardenedDemoProvider>
  <HardenedErrorBoundary>
    <YourRouter />
  </HardenedErrorBoundary>
</HardenedDemoProvider>
```

## Query client integration

After creating your QueryClient:

```tsx
import { installHardenedQueryDefaults } from "@/hardening/queryDefaults";

const queryClient = new QueryClient();
installHardenedQueryDefaults(queryClient);
```

Do not use unlimited retries. The default hardening policy deliberately caps retries.

## Navigation shell

Use:

```tsx
<HardenedDAppShell>
  <Routes />
</HardenedDAppShell>
```

This adds:

- network recovery banner
- demo banner
- route tracking
- route-level ErrorBoundary
- command palette handling
- mobile navigation cleanup

## Wallet integration

Replace the old demo wallet hook with:

```tsx
import { useHardenedDappWallet } from "@/hooks/useHardenedDappWallet";
```

The hook intentionally treats:

- missing provider
- user rejection
- provider disconnect
- account changes
- chain changes
- unsupported networks

as independent states.

## Action pattern

Every blockchain action should follow this pattern:

```tsx
const result = await requestAccounts();
if (!result.ok) {
  setError(result.error);
  return;
}
```

Never throw raw provider errors directly into JSX.

## Safe navigation

Do not interpolate arbitrary user-controlled values into `navigate()`.

Use:

```tsx
navigateSafely(navigate, targetPath);
```

or:

```tsx
<GuardedLink href={targetPath}>Open</GuardedLink>
```

## Demo data

Use the validated provider:

```tsx
<HardenedDemoProvider>
  ...
</HardenedDemoProvider>
```

It validates demo records, checks cross-record references and falls back to the hero scenario when demo generation fails.

## Route-level isolation

Wrap high-risk pages separately when useful:

```tsx
<RouteRecoveryBoundary>
  <ApplicationDetail />
</RouteRecoveryBoundary>
```

That prevents one application record or visualization component from taking down the entire DApp.

## Error display rules

Keep technical details out of production UI. `normalizeAppError()` contains:

- internal code
- internal message
- user-safe message
- retryable flag
- recoverable flag
- source
- metadata

Use `error.userMessage` for users.

## Retry rules

A retry is appropriate for:

- timeout
- offline recovery
- transient HTTP 5xx
- rate limiting
- temporary RPC/provider interruption

Do not automatically retry:

- user rejection
- invalid wallet address
- invalid transaction hash
- unsupported route
- authorization failure
- deterministic policy rejection

## Polling rules

Pause polling when:

- the browser is offline
- the document is hidden
- there is no active application
- the current operation is not expected to change

Use `pollingPolicy.ts` and `useDocumentVisible()`.

## Storage rules

Never call localStorage/sessionStorage directly for critical recovery state. Use:

```tsx
resolveStorage()
readJson()
writeJson()
removeSafe()
```

Browser privacy modes and embedded WebViews can disable or throw from storage APIs.

## Production boundary

The mock system is only presentation data. Never use demo state to authorize:

- loan acceptance
- contract execution
- wallet transfer
- credit limits
- policy approval
- authentication

Server-side state remains authoritative.

## Testing

Run:

```bash
pnpm check
pnpm test
pnpm build
```

The hardening tests specifically cover retry behavior, chain validation, navigation sanitization, storage failures, demo integrity, wallet errors, transaction validation, error recovery and caching.

## Suggested final demo test matrix

### Healthy

- wallet connected
- supported network
- all services healthy
- all demo pages populated

### Wallet missing

- no injected provider
- connect button remains usable
- no uncaught provider exception

### User rejection

- connect request rejected
- app remains usable
- no infinite retry

### Wrong network

- wallet connected to unsupported chain
- DApp shows switch-network state
- normal read-only routes remain available

### Offline

- browser offline
- polling stops
- read-only UI stays mounted
- mutating actions are disabled

### Slow verifier

- timeout after bounded period
- retry state visible
- existing application ID preserved

### Corrupt demo data

- malformed record
- validation catches it
- hero fallback loads
- DApp does not crash

### Invalid route

- unknown route
- safe 404
- no external redirect

### Runtime component failure

- child component throws
- route recovery card appears
- dashboard remains reachable

### Storage blocked

- localStorage throws
- session state still loads from in-memory defaults
- no startup crash

### Refresh race

- slow request starts
- user navigates away
- stale response is ignored

## Key engineering principle

The frontend should degrade from:

`fully live`

→ `live but partially degraded`

→ `read-only`

→ `demo fallback`

→ `recoverable error`

without reaching a blank screen or silently presenting a false successful financial state.
