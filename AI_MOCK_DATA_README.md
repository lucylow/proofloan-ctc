# ProofLoan AI Mock Data

This layer adds 22 deterministic AI underwriting scenarios for UI, explanation, confidence, what-if, proof-latency, and failure-state walkthroughs.

## Boundary

Attestcoin evidence, Creditcoin application processing, AI interpretation, and RiskGuard policy stay separate. The mock AI layer does **not** replace live cryptographic verification and cannot authorize a Creditcoin action.

Every fixture fact is labeled `evidenceMode=mock` with `source=ai-mock`. Mock recommendations are advisory.

## Surface

- DApp page: `/ai-mock`
- tRPC: `aiMock.list`, `aiMock.scenarios`, `aiMock.dashboard`, `aiMock.scenario`, `aiMock.simulateFailure`, `aiMock.metrics`
- Types: `shared/aiMockTypes.ts`
- Fixtures: `server/ai-mock/`
- UI: `client/src/pages/AiMock.tsx`, `client/src/components/AiMockScenarioPanel.tsx`

## Scenarios

Strong repayment, cross-chain wealth, recent late payment, high leverage, sparse evidence, fresh / aging / stale evidence, proof delayed, proof rejected, partial attestation, multi-chain consistency, new wallet, high risk, mixed signals, collateral-heavy, stable / volatile activity, low liquidity, recovery, and a judge-ready demo.

## Validation

```bash
pnpm test server/ai-mock/ai-mock-data.test.ts server/ai-mock.router.test.ts
```

The page-sized code walkthrough is in `AI_MOCK_DATA_120_PAGES.md`. Wiring notes are in `AI_MOCK_INTEGRATION.md`.
