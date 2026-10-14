# Recurring Payment Agent

Durable weekly/monthly scheduler prepares unsigned payments, preserving each occurrence across restarts. UTC dates are validated; monthly dates clamp to month-end without drifting from the original day.

```powershell
node scripts/remaining-payments.mjs schedule configs/remaining/payments/demo.json configs/remaining/payments/monthly.json evidence/remaining/payments/monthly-state.json evidence/remaining/payments/schedule-live.json 2026-10-14T01:00:00Z
node scripts/remaining-payments.mjs worker configs/remaining/payments/demo.json configs/remaining/payments/monthly.json evidence/remaining/payments/monthly-state.json evidence/remaining/payments/schedule-restart.json 60000
```

Worker arguments after output are polling milliseconds and optional finite run count. Omit count to run continuously; Ctrl+C stops it. For a bounded restart demonstration, use `10 2`. The worker prepares on the first poll at/after due time; host sleep, downtime, RPC delays and prior pending signatures can delay preparation. It does not promise exact wall-clock delivery. A service supervisor must keep the process running.

For a transaction signed independently by the user, reconcile with:

```powershell
node scripts/remaining-payments.mjs reconcile configs/remaining/payments/demo.json STATE_FILE OCCURRENCE_ID TRANSACTION_HASH OUTPUT_FILE
```

| Requirement | Implementation and evidence |
|---|---|
| 01 Weekly/monthly schedule | `dueAt`, UTC monthly clamping and weekly tests; `monthly.json`. |
| 02 Prepare and track statuses | Live `schedule-live.json` pending envelope; local `local-receipts-final.json` proves pending confirmation, paid and reverted/failed states with real local receipts. |
| 03 Balance/failure without duplicate payments | Atomic file replacement, exclusive per-state lock, occurrence IDs, no auto-retry after failure; one unresolved payment at a time avoids nonce reuse. Local insufficient balance rejection, forced revert and restart evidence; tests cover restart failure/idempotence. |
| 04 History and next payment | Persisted `history` and `nextDue`; `schedule-restart.json` unchanged after two worker ticks, local final receipt evidence includes paid/failed history. |

Reconciliation checks sender, destination, value, calldata, nonce, chain ID (including legacy EIP-155 v), transaction and block hashes, receipt sender/destination, confirmation threshold and exact ERC20 Transfer recipient/value. Wrong receipts cannot bind an occurrence. Missing/unconfirmed receipts stay pending. Failed transactions are never silently re-prepared. Payment is never inferred from a balance change.

Limits: local receipts are not Pharos payments. No public transaction was sent. Worker skips transient lock contention and retries next poll. State files are trusted local data, not a distributed ledger; use one file per schedule and one wallet scheduling process. Multiple independent schedules do not coordinate wallet nonces. After a crash while preparing, a pending occurrence blocks further work for manual inspection; do not delete state or locks until the process is confirmed stopped and payment status is checked. Confirmations reduce but do not eliminate reorg risk. Past paid entries are not continuously revalidated. Repeating failures are recorded, not retried automatically; corrected payments require explicit operator handling.

Run from the repository root after `npm ci` (Node 22 or later). Public reads use only the official Chain MCP through `src/mcp.mjs`. The reference sender is a public funded EOA; we do not claim ownership or possess its keys. No production command signs or broadcasts. Live evidence is read-only Pharos chain 1672; actual successful/reverted receipts are from a separate ephemeral local EVM chain 31337.

Validation: `node --test tests/remaining-payments.test.mjs` (15 passing behavioural tests). Evidence: `evidence/remaining/payments/tests.txt`. Local receipt demo: `node scripts/remaining-payments-local-demo.mjs evidence/remaining/payments/fresh-local-demo.json` (choose a fresh output path). On Node 24, Ganache warns about unavailable native uWS and successfully uses its JS fallback.
