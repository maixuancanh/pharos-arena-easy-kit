# Submission copy — three separate Arena builds

Status: code and live MCP evidence are ready locally. No public repository/demo has been published; no registration, submission or social post has been sent. These blocks describe observed results, not awarded points.

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

## Finish publication and submit

1. Publish this source package to the user's chosen GitHub repository. The single repository can host all three tasks, with a distinct task README link for each submission.
2. Optionally host the static evidence report as a public proof page. Label it as a captured demonstration; the runnable CLI is in the repository.
3. Complete the campaign form using the user's actual email, Telegram, Discord and GitHub details. Do not assume those details or claim Telegram membership before it is true.
4. Sign into Arena with the user's GitHub account and submit each task separately. Use the published task README/repo and proof URLs. The authenticated form's exact field labels have not been inspected.
5. Optional video bonus: record each real CLI run, show the MCP endpoint and output, publish the walkthrough on the required social platform, and add its real URL. No video exists in this package, and no bonus is claimed.

Potential base score: **150 points if all three tasks are accepted for full credit**. The official announcement supplied by the user and current leaderboard disagree about whether bonuses count toward rank; confirm before claiming Contributor status.
