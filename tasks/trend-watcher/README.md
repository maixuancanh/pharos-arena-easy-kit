# Trend watcher

Persistent JSON history reloads on every observation. Configurable up/down rules require at least three readings. Observation IDs deduplicate restarts, timestamps reject out-of-order input, and a trend episode triggers only once. Controlled readings 100,30,100,90,80,70 prove an isolated spike does not trigger; observation 5 confirms 100->90->80. Evidence includes the exact event, rule and observation IDs.

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
- Evidence under [execution evidence](../../evidence/remaining/execution): trend.json.
- [Workflow implementation](../../src/remaining/execution.mjs), [local contracts](../../contracts/remaining/ExecutionLab.sol), [runner](../../scripts/remaining-execution-demo.mjs).
- [Portable skill](../../skills/pharos-trend-watcher/SKILL.md).
- [Archived exact requirements](../../docs/remaining-task-requirements.json).

## Verification boundary

Trend fixtures are not live oracle prices. live-gas.json contains three genuine Chain MCP quotes; live-trend.json records those same actual readings processed by the persistent trend watcher. These short-interval readings are separate from the controlled spike demonstration and do not establish a market trend. No ai.pharos.xyz import.

Persistence uses atomic replacement and an exclusive per-state-file writer lock. A crash can require manual lock cleanup and receipt reconciliation; automatic crash recovery is intentionally conservative. Local evidence hashes cannot be opened on a Pharos explorer. Ganache may print a harmless native uWS compatibility warning and use its JavaScript fallback.
