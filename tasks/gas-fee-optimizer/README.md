# Gas fee optimizer

Persistent history and queue hold expensive transactions until favorable gas or the first deadline tick. Real local receipts calculate gasUsed * effective gas price; compare with gasUsed * request-time quote. A favorable run pays less and a deadline run submits despite higher gas. All jobs due in a tick are broadcast before any receipt wait. The wall-clock worker records actual lateness rather than hiding it.

## Reproduce

From the repository root with Node 22 or newer:

```sh
npm ci
node --test tests/remaining-execution.test.mjs tests/remaining-execution-evm.test.mjs
node scripts/remaining-execution-demo.mjs --live
node scripts/remaining-execution-worker.mjs
```

Omit --live for a deterministic offline demonstration. All signing uses ephemeral Ganache accounts on local chain 31337; no user keys are loaded or stored. --live adds read-only Pharos Chain MCP gas quotes, never a public-chain broadcast.

## Evidence and implementation

- [Summary](../../evidence/remaining/execution-summary.json)
- Evidence under [execution evidence](../../evidence/remaining/execution): gas.json and gas-worker.json.
- [Workflow implementation](../../src/remaining/execution.mjs), [local contracts](../../contracts/remaining/ExecutionLab.sol), [runner](../../scripts/remaining-execution-demo.mjs).
- [Portable skill](../../skills/pharos-gas-fee-optimizer/SKILL.md).
- [Archived exact requirements](../../docs/remaining-task-requirements.json).

## Verification boundary

PARTIAL against the literal never-misses-deadline criterion. A process cannot guarantee timing during downtime, RPC failures, suspension or signature delays. Timer scheduling is best effort; latest recorded worker run was 1 ms late. Submission time marks dispatch start, not node acceptance; mining deadline is not guaranteed. Quotes in controlled demos are fixtures; live-gas.json is independent read-only network evidence.

Persistence uses atomic replacement and an exclusive per-state-file writer lock. A crash can require manual lock cleanup and receipt reconciliation; automatic crash recovery is intentionally conservative. Local evidence hashes cannot be opened on a Pharos explorer. Ganache may print a harmless native uWS compatibility warning and use its JavaScript fallback.
