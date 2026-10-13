# Submission copy — three separate Arena builds

Status updated 13 October 2026: all three tasks were submitted through Arena under @maixuancanh and verified IN REVIEW in My work. Public repository: https://github.com/maixuancanh/pharos-arena-easy-kit . Public proof page: https://maixuancanh.github.io/pharos-arena-easy-kit/ . No video was submitted and no points have been awarded. The separate campaign registration form was not changed; its prior registration status is unknown. Reward wallet is blank and was not changed.

## Read Contract State

Task: https://pharos-agent-arena.vercel.app/tasks/read-contract-state

**Title**

Pharos USDC State Reader

**Description**

This CLI reads the name, symbol, decimals and total supply of the officially listed USDC contract on Pharos Pacific mainnet through Chain MCP. It pins every view call to the same block, labels the contract address and block number, and formats the supply using the token's decimals without losing integer precision. The captured run read block 20147121 and returned a supply of 17255330.463491 USDC. The package includes installation instructions, tests, sample output and the original MCP request/response transcript.

**Proof to publish**: `tasks/read-contract-state/README.md`, `evidence/read-final-output.json`, `evidence/read-final-mcp.jsonl`; readable summary at `index.html#read`.

## Event/Log Monitor

Task: https://pharos-agent-arena.vercel.app/tasks/event-log-monitor

**Title**

Pharos USDC Transfer Monitor

**Description**

A continuously polling USDC Transfer monitor built on Pharos Chain MCP. Queries are filtered by contract address and the Transfer signature, and paginated into windows of at most 1,000 blocks. Each event includes readable sender, recipient, amount, transaction hash and block. A persisted cursor and event identity checks prevent repeats during ordinary polling and restarts. The recorded 15-poll run captured 17 unique events, including three from blocks created after the monitor started. A two-poll restart captured three further events with no repeated identities. Confirmation depth and crash/reorg limitations are documented.

**Example observed transaction**

https://pharosscan.xyz/tx/0xb469bfb4ff6ad987f593b748dd114a26c3fd7e7bc9944caddff722e6d1910cf3

This is a third-party public transaction observed by the monitor, not a transaction created by this build. Use the transcript and console capture as proof of monitoring, alongside the explorer reference.

**Proof to publish**: `tasks/event-log-monitor/README.md`, `evidence/monitor-console.jsonl`, `evidence/monitor-mcp.jsonl`, `evidence/monitor-resume-output.json`; readable summary at `index.html#monitor`.

## Doc-Search CLI

Task: https://pharos-agent-arena.vercel.app/tasks/doc-search-cli

**Title**

Pharos Docs Answer CLI

**Description**

A lightweight CLI on top of Pharos Developer Docs MCP. Developers ask a natural-language question in the terminal and receive a concise answer with documentation links. The tool calls the official askQuestion method and preserves its sources; it returns a clear no-answer result when the response is unsupported or unsourced. The README includes three real query outputs covering mainnet configuration, Foundry deployment and event-log queries, plus an unsupported-question example. Original MCP transcripts are included so reviewers can inspect the source of every captured answer.

**Proof to publish**: `tasks/doc-search-cli/README.md`, the `evidence/docs-*.json` outputs and `evidence/docs-*-mcp.jsonl` transcripts; readable summary at `index.html#docs`.

## Submission record

| Task | Proof URL | Verified status |
|---|---|---|
| Read Contract State | https://maixuancanh.github.io/pharos-arena-easy-kit/#read | IN REVIEW |
| Event/Log Monitor | https://maixuancanh.github.io/pharos-arena-easy-kit/#monitor | IN REVIEW |
| Doc-Search CLI | https://maixuancanh.github.io/pharos-arena-easy-kit/#docs | IN REVIEW |

Each submission includes the public repo link, task-specific run instructions, original MCP evidence links and honest limitations. Video fields were left blank. Submission confirmations were observed on each task and all three rows appeared on https://pharos-agent-arena.vercel.app/me . No resubmissions were made.

Potential base score: **150 points if all three are approved for full credit**. The reward wallet is still blank; the user's chosen address must be provided separately. The authenticated form did not block submission on that field.
