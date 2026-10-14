# Batch executor

Four requirements demonstrated locally: accepts three independent calls, one multicall transaction, per-action events including a mined partial failure, and measured gas/step comparison. The recorded run used 109763 gas individually versus 83990 batched, saving 25773 gas; deployment is excluded. Two successful actions persist while the failing action leaves its mapping entry unchanged.

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
- Evidence under [execution evidence](../../evidence/remaining/execution): batch.json.
- [Workflow implementation](../../src/remaining/execution.mjs), [local contracts](../../contracts/remaining/ExecutionLab.sol), [runner](../../scripts/remaining-execution-demo.mjs).
- [Portable skill](../../skills/pharos-batch-executor/SKILL.md).
- [Archived exact requirements](../../docs/remaining-task-requirements.json).

## Verification boundary

The contract is a local demonstration. Arbitrary calls are not guaranteed independent: callers must validate independence. No Pharos deployment or ai.pharos.xyz import has been claimed.

Persistence uses atomic replacement and an exclusive per-state-file writer lock. A crash can require manual lock cleanup and receipt reconciliation; automatic crash recovery is intentionally conservative. Local evidence hashes cannot be opened on a Pharos explorer. Ganache may print a harmless native uWS compatibility warning and use its JavaScript fallback.
