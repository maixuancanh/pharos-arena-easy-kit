# Arbitrage scanner

Two price adapters execute concurrently in the same scan. Distinct, contemporaneous fresh sources are required. Gross = quantity*(sell-buy); costs include both notionals times swap fee and slippage basis points, plus gas in quote currency. Only net > configured threshold prepares a simulated intent; every scan logs sources, gross, costs, net and decision. Profitable and below-threshold examples are included. Source failures, stale quotes and numeric overflow fail closed.

## Reproduce

From the repository root with Node 22 or newer:

```sh
npm ci
node --test tests/remaining-execution.test.mjs tests/remaining-execution-evm.test.mjs
node scripts/remaining-execution-demo.mjs --live
```

Omit --live for a deterministic offline demonstration. All signing uses ephemeral Ganache accounts on local chain 31337; no user keys are loaded or stored. --live adds read-only Pharos Chain MCP gas quotes, never a public-chain broadcast.

## Evidence and implementation

- [Summary](../../evidence/remaining/execution-summary.json)
- Evidence under [execution evidence](../../evidence/remaining/execution): arbitrage.json.
- [Workflow implementation](../../src/remaining/execution.mjs), [local contracts](../../contracts/remaining/ExecutionLab.sol), [runner](../../scripts/remaining-execution-demo.mjs).
- [Portable skill](../../skills/pharos-arbitrage-scanner/SKILL.md).
- [Archived exact requirements](../../docs/remaining-task-requirements.json).

## Verification boundary

Both price sources are distinct real local EVM reference-rate contracts, read at a shared pinned block. Their prices are controlled test inputs, not live Pharos pools or an oracle. Simulated execution is allowed by the archived organizer requirement. Prepared output is a simulated trade intent, not executable calldata. Floating point estimates are unsuitable for production settlement; token-unit fixed-point arithmetic and executable quotes are needed before real use. No public-chain trades or ai.pharos.xyz import.

Persistence uses atomic replacement and an exclusive per-state-file writer lock. A crash can require manual lock cleanup and receipt reconciliation; automatic crash recovery is intentionally conservative. Local evidence hashes cannot be opened on a Pharos explorer. Ganache may print a harmless native uWS compatibility warning and use its JavaScript fallback.
