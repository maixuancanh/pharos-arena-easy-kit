---
name: pharos-saga-executor
description: Run and inspect the Arena saga executor implementation with labelled local EVM or simulated evidence.
---

# Saga executor

Use this package from a checkout of pharos-arena-easy-kit. Read [task details](../../tasks/saga-executor/README.md) and run `node scripts/remaining-execution-demo.mjs --live` at the repository root. Inspect `evidence/remaining/execution/saga-success.json` and the summary before describing results. For gas wall-clock timing also run `node scripts/remaining-execution-worker.mjs`.

Three dependent approve -> swap -> deposit steps each await a successful receipt. The retry budget is three attempts with linear delay, only for explicitly safe transient pre-broadcast errors. The demo injects one such error, then demonstrates full success and a mined deposit revert. Compensation unwinds swap then clears approval; cash returns to 1000. Terminal restart produces no duplicate transaction. Durable JSON logs record each transition and hash.

The local contract is reversible accounting, not an actual DEX or vault. Real compensation can incur slippage or fail. Ambiguous broadcasts and pending states halt for receipt reconciliation instead of rebroadcasting. Crash leftovers retain an exclusive lock; operator must verify no writer remains before removing the lock. No Pharos receipts or ai.pharos.xyz import.

Never turn fixture prices, chain 31337 receipts or a prepared intent into a claim of Pharos execution. The live MCP capability is read-only. Do not add user keys or broadcast on public networks. Preserve persisted pending/unknown state for reconciliation; do not clear it to force another send. Report exact failed requirements rather than calling a partial run complete.
