---
name: pharos-gas-fee-optimizer
description: Run and inspect the Arena gas fee optimizer implementation with labelled local EVM or simulated evidence.
---

# Gas fee optimizer

Use this package from a checkout of pharos-arena-easy-kit. Read [task details](../../tasks/gas-fee-optimizer/README.md) and run `node scripts/remaining-execution-demo.mjs --live` at the repository root. Inspect `evidence/remaining/execution/gas.json` and the summary before describing results. For gas wall-clock timing also run `node scripts/remaining-execution-worker.mjs`.

Persistent history and queue hold expensive transactions until favorable gas or the first deadline tick. Real local receipts calculate gasUsed * effective gas price; compare with gasUsed * request-time quote. A favorable run pays less and a deadline run submits despite higher gas. All jobs due in a tick are broadcast before any receipt wait. The wall-clock worker records actual lateness rather than hiding it.

PARTIAL against the literal never-misses-deadline criterion. A process cannot guarantee timing during downtime, RPC failures, suspension or signature delays. Timer scheduling is best effort; latest recorded worker run was 1 ms late. Submission time marks dispatch start, not node acceptance; mining deadline is not guaranteed. Quotes in controlled demos are fixtures; live-gas.json is independent read-only network evidence.

Never turn fixture prices, chain 31337 receipts or a prepared intent into a claim of Pharos execution. The live MCP capability is read-only. Do not add user keys or broadcast on public networks. Preserve persisted pending/unknown state for reconciliation; do not clear it to force another send. Report exact failed requirements rather than calling a partial run complete.
