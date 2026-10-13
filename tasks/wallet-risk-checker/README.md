# Wallet Risk Checker

[Arena task](https://pharos-agent-arena.vercel.app/tasks/wallet-risk-checker) · Medium · Batch order 4/10

## Result

A verified older contract sample scored low; an unverified contract with a high observed failure fraction scored medium. Five signals are evaluated with explicit unknown states.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs risk --wallet 0x869379f2d9df67891e0159dd2520dc1681908f10 --since 2026-10-01T00:00:00Z --until 2026-10-13T23:40:17.095Z --max-pages 3 --config configs/ten/risk.json --output my-risk.json --evidence my-risk-explorer.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Signals: code verification, contract age, failed history, flagged counterparties and owner unlimited approvals.
- Risk level, numeric weights and specific reasons are included.
- Each signal explains its meaning without labelling a wallet malicious.
- Real low and medium/high examples: risk-clean.json and risk-observed.json.

## Captured evidence

- [risk-clean output](../../evidence/ten/risk-clean.json)
- [risk-observed output](../../evidence/ten/risk-observed.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

Both examples use bounded, partial history. Low means no observed configured flags, not proven safe or clean. An empty flagged list is unknown, not a pass. Only successful approvals sent by the checked owner are sampled; no external threat-intelligence feed is claimed.

This task has been implemented and locally verified. It has not been submitted to Arena in this batch and has no awarded points.
