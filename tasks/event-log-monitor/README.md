# Pharos USDC Transfer Monitor

[Arena task](https://pharos-agent-arena.vercel.app/tasks/event-log-monitor) · Easy · 50 potential points

## Install and run

Node.js 22+, from the repo root:

```sh
npm ci
node cli.mjs monitor
```

Runs continuously until Ctrl+C. Filter: USDC **0xc879c018db60520f4355c26ed1a6d572cdac1815**, topic **0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef**. Default polling is 5 seconds, with three confirmation blocks. First run backfills 100 recent confirmed blocks. Later runs resume from the saved checkpoint.

For bounded evidence capture:

```sh
node cli.mjs monitor --polls 15 --state .state/demo.json --output my-monitor.json --evidence my-monitor-mcp.jsonl
node cli.mjs monitor --polls 2 --state .state/demo.json
```

Do not pass --from when resuming. To start from a specific block, use --from and a fresh --state filename. Do not share a checkpoint between simultaneous processes.

## Actual live event

The initial run completed **15 polls**, capturing **17 distinct events**, **3 after-start events**. Resume captured **3 additional events**, with zero duplicate identities across runs.

```json
{
  "kind": "Transfer",
  "id": "0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3:0",
  "contract": "0xc879c018db60520f4355c26ed1a6d572cdac1815",
  "from": "0x912c9aDe24D44d8922f0866D8Dcb079f1363f647",
  "to": "0x936564245B69f5a293b42cbd752E0eE3bb68b470",
  "amount": "78.496253",
  "amountRaw": "78496253",
  "transactionHash": "0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3",
  "block": 20146968,
  "logIndex": 0,
  "explorer": "https://pharosscan.xyz/tx/0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3",
  "symbol": "USDC",
  "observedAt": "2026-10-13T14:49:02.814Z",
  "observedAfterStart": true
}
```

[Observed transaction](https://pharosscan.xyz/tx/0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3). This was an existing public user's transaction; the monitor did not create it.

## Requirements

- Chain MCP get_logs filters by address and Transfer signature.
- Polling continues until stopped; pagination uses no more than 1,000 blocks per query.
- Decodes from, to, amount, transaction hash and block; tx hash + log index deduplicates logs.
- Captured new mainnet events while the monitor was already running.

The cursor advances only after a successful batch; state is written atomically and guarded with a lock. A crash between stdout and checkpoint can replay a batch; deep reorgs are not reconciled. Confirmation depth is a delay, not a finality guarantee. Failed queries are retried on the next poll; three consecutive failures stop the process.

[Console capture](../../evidence/monitor-console.jsonl) · [Raw MCP](../../evidence/monitor-mcp.jsonl) · [Resume output](../../evidence/monitor-resume-output.json) · [Implementation](../../src/monitor.mjs)

Status: implemented and live-tested. Reviewer approval is pending.
