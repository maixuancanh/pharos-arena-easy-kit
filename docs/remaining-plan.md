# Remaining twelve Arena builds

Goal: implement the six Medium and six Hard tasks still unsubmitted on 14 October 2026. Exact organizer criteria are archived in remaining-task-requirements.json.

Architecture: extend the existing read-only Pharos MCP client. Separate payment preparation, durable workflow execution and protocol adapters. Public-chain data, local EVM receipts and synthetic test inputs must be labelled separately. No user keys or real-money broadcasts. Prepared transactions are not claimed as paid transactions.

## Payment subsystem
- [ ] Implement natural-language parsing with explicit ambiguity responses, validated token/recipient and live balance check; summary precedes unsigned transaction generation.
- [ ] Read JSON and text invoices, reject missing/conflicting fields, preserve invoice reference in the prepared envelope.
- [ ] Persist weekly/monthly payment occurrences; pending/paid/failed state, idempotence, verified receipt reconciliation, next due date.
- [ ] Test malformed amounts, ambiguous intent, restart, insufficient balance and duplicate payment prevention; collect live read-only evidence.

## Execution subsystem
- [ ] Batch at least three independent actions, report per-call outcomes and step reduction.
- [ ] Saga: three receipt-verified dependent steps, bounded transient retries, explicit compensation and durable log. Demonstrate success and forced failure on local EVM.
- [ ] Trend: persistent observations, configurable >=3-observation rule, restart/deduplication and spike suppression.
- [ ] Gas: persistent price history, deadline-aware queue, local EVM receipts and actual paid-gas comparison. Clearly bound scheduler timing guarantees.
- [ ] Arbitrage: two same-scan sources, fees/slippage/gas net calculation and threshold gate. Simulated execution labelled.

## Protocol subsystem
- [ ] Discover official deployed Pharos contracts and validate bytecode/ABI before using their rates or positions.
- [ ] Liquidation: collateral/debt/health, configured thresholds and timestamped actionable console alerts.
- [ ] Portfolio: two protocols/vaults plus wallet balances, five question types, contract/block citations and unknown states.
- [ ] Yield: three live chain sources, gas/entry/exit costs and holding period, net recommendation.
- [ ] Aggregator: two venues, queries and unsigned deposit/withdraw, justified routing and partial-outage isolation.
- [ ] Never substitute invented rates/contracts for unavailable live requirements; preserve evidence and identify remaining gaps.

## Integration and verification
- [ ] Run domain tests then full regression suite.
- [ ] Review each task against archived requirements and inspect original evidence.
- [ ] Publish per-task READMEs and one proof page with reproducible commands and evidence boundaries.
- [ ] Submit only tasks whose required evidence is verified; keep incomplete tasks explicitly pending.

Ownership: payment agent owns src/remaining/payments*, scripts/remaining-payments*, tests/remaining-payments*, corresponding three task READMEs. Execution agent owns src/remaining/execution*, scripts/remaining-execution*, contracts/remaining*, corresponding five task READMEs. Protocol agent owns src/remaining/defi*, scripts/remaining-defi*, corresponding four task READMEs. Root owns dependency updates, integration and publication. No agent changes shared package files or broadcasts public-chain transactions.
