---
name: pharos-arbitrage-scanner
description: Run and inspect the Arena arbitrage scanner implementation with labelled local EVM or simulated evidence.
---

# Arbitrage scanner

Use this package from a checkout of pharos-arena-easy-kit. Read [task details](../../tasks/arbitrage-scanner/README.md) and run `node scripts/remaining-execution-demo.mjs --live` at the repository root. Inspect `evidence/remaining/execution/arbitrage.json` and the summary before describing results. For gas wall-clock timing also run `node scripts/remaining-execution-worker.mjs`.

Two price adapters execute concurrently in the same scan. Distinct, contemporaneous fresh sources are required. Gross = quantity*(sell-buy); costs include both notionals times swap fee and slippage basis points, plus gas in quote currency. Only net > configured threshold prepares a simulated intent; every scan logs sources, gross, costs, net and decision. Profitable and below-threshold examples are included. Source failures, stale quotes and numeric overflow fail closed.

Both price sources are distinct real local EVM reference-rate contracts, read at a shared pinned block. Their prices are controlled test inputs, not live Pharos pools or an oracle. Simulated execution is allowed by the archived organizer requirement. Prepared output is a simulated trade intent, not executable calldata. Floating point estimates are unsuitable for production settlement; token-unit fixed-point arithmetic and executable quotes are needed before real use. No public-chain trades or ai.pharos.xyz import.

Never turn fixture prices, chain 31337 receipts or a prepared intent into a claim of Pharos execution. The live MCP capability is read-only. Do not add user keys or broadcast on public networks. Preserve persisted pending/unknown state for reconciliation; do not clear it to force another send. Report exact failed requirements rather than calling a partial run complete.
