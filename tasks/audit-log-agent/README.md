# Audit-Log Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/audit-log-agent) · Medium · Batch order 2/10

## Result

The captured report contains 8 unique transactions. Both normal and ERC20 history reached the selected interval start in the indexer. Markdown and CSV exports are included.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs audit --wallet 0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1 --since 2026-10-01T00:00:00Z --until 2026-10-13T23:40:17.095Z --output my-audit.json --evidence my-audit-explorer.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Wallet and ISO date bounds: CLI --wallet, --since, --until.
- Categories: transfers in/out, swaps, approvals, contract interactions and failed calls.
- Exact native/token totals and transaction links: activity.categories and activity.records.
- Exports: audit.json.md and audit.json.csv.

## Captured evidence

- [audit output](../../evidence/ten/audit.json)

[Markdown report](../../evidence/ten/audit.json.md) · [CSV report](../../evidence/ten/audit.json.csv)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

Method labels/selector classification of swaps and contract calls is heuristic. Token events are indexed Transfers. Counts are activity records, with separate unique transaction counts. No USD conversion. A page cap produces an explicitly partial report; indexer completeness is not guaranteed.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
