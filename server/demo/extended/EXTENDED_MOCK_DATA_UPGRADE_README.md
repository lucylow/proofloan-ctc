# Extended Mock Data Upgrade

This continuation adds a large deterministic mock catalog on top of the existing ProofLoan demo/fallback layer.

## Design goals

- More realistic demo breadth without network calls.
- Deterministic evidence for repeatable judging and UI screenshots.
- Coverage of evidence freshness, risk, AI abstention, RiskGuard blocking, Attestor failures, RPC failures, Proof Builder failures, gas pressure, Merkle pressure, operator recovery, and reorg recovery.
- Every generated fact is explicitly marked `evidenceMode: "mock"` and carries `demoProfile` and `source` metadata.
- Existing live behavior is unchanged; these are demo-only endpoints.

## New API operations

- `demo.extendedCases`
- `demo.extendedCase`
- `demo.searchExtendedCases`
- `demo.extendedBatch`
- `demo.evaluateExtendedCase`

## Safety

Mock cases never prove a live source-chain fact and must not be used for production lending or collateral decisions.
