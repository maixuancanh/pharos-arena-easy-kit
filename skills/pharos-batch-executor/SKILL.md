---
name: pharos-batch-executor
description: Run and inspect the Arena batch executor implementation with labelled local EVM or simulated evidence.
---

# Batch executor

Use this package from a checkout of pharos-arena-easy-kit. Read [task details](../../tasks/batch-executor/README.md) and run `node scripts/remaining-execution-demo.mjs --live` at the repository root. Inspect `evidence/remaining/execution/batch.json` and the summary before describing results. For gas wall-clock timing also run `node scripts/remaining-execution-worker.mjs`.

Four requirements demonstrated locally: accepts three independent calls, one multicall transaction, per-action events including a mined partial failure, and measured gas/step comparison. The recorded run used 109763 gas individually versus 83990 batched, saving 25773 gas; deployment is excluded. Two successful actions persist while the failing action leaves its mapping entry unchanged.

The contract is a local demonstration. Arbitrary calls are not guaranteed independent: callers must validate independence. No Pharos deployment or ai.pharos.xyz import has been claimed.

Never turn fixture prices, chain 31337 receipts or a prepared intent into a claim of Pharos execution. The live MCP capability is read-only. Do not add user keys or broadcast on public networks. Preserve persisted pending/unknown state for reconciliation; do not clear it to force another send. Report exact failed requirements rather than calling a partial run complete.
