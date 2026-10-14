---
name: pharos-trend-watcher
description: Run and inspect the Arena trend watcher implementation with labelled local EVM or simulated evidence.
---

# Trend watcher

Use this package from a checkout of pharos-arena-easy-kit. Read [task details](../../tasks/trend-watcher/README.md) and run `node scripts/remaining-execution-demo.mjs --live` at the repository root. Inspect `evidence/remaining/execution/trend.json` and the summary before describing results. For gas wall-clock timing also run `node scripts/remaining-execution-worker.mjs`.

Persistent JSON history reloads on every observation. Configurable up/down rules require at least three readings. Observation IDs deduplicate restarts, timestamps reject out-of-order input, and a trend episode triggers only once. Controlled readings 100,30,100,90,80,70 prove an isolated spike does not trigger; observation 5 confirms 100->90->80. Evidence includes the exact event, rule and observation IDs.

Trend fixtures are not live oracle prices. live-gas.json contains three genuine Chain MCP quotes; live-trend.json records those same actual readings processed by the persistent trend watcher. These short-interval readings are separate from the controlled spike demonstration and do not establish a market trend. No ai.pharos.xyz import.

Never turn fixture prices, chain 31337 receipts or a prepared intent into a claim of Pharos execution. The live MCP capability is read-only. Do not add user keys or broadcast on public networks. Preserve persisted pending/unknown state for reconciliation; do not clear it to force another send. Report exact failed requirements rather than calling a partial run complete.
