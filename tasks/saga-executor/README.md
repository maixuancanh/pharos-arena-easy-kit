# Saga executor

Three dependent approve -> swap -> deposit steps each await a successful receipt. The retry budget is three attempts with linear delay, only for explicitly safe transient pre-broadcast errors. The demo injects one such error, then demonstrates full success and a mined deposit revert. Compensation unwinds swap then clears approval; cash returns to 1000. Terminal restart produces no duplicate transaction. Durable JSON logs record each transition and hash.

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
- Evidence under [execution evidence](../../evidence/remaining/execution): saga-success.json and saga-forced-failure.json.
- [Workflow implementation](../../src/remaining/execution.mjs), [local contracts](../../contracts/remaining/ExecutionLab.sol), [runner](../../scripts/remaining-execution-demo.mjs).
- [Portable skill](../../skills/pharos-saga-executor/SKILL.md).
- [Archived exact requirements](../../docs/remaining-task-requirements.json).

## Verification boundary

The local contract is reversible accounting, not an actual DEX or vault. Real compensation can incur slippage or fail. Ambiguous broadcasts and pending states halt for receipt reconciliation instead of rebroadcasting. Crash leftovers retain an exclusive lock; operator must verify no writer remains before removing the lock. No Pharos receipts or ai.pharos.xyz import.

Persistence uses atomic replacement and an exclusive per-state-file writer lock. A crash can require manual lock cleanup and receipt reconciliation; automatic crash recovery is intentionally conservative. Local evidence hashes cannot be opened on a Pharos explorer. Ganache may print a harmless native uWS compatibility warning and use its JavaScript fallback.
