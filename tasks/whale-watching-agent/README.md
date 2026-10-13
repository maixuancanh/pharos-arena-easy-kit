# Whale-Watching Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/whale-watching-agent) · Medium · Batch order 3/10

## Result

Five configurable public addresses; 4 significant USDC moves matched the configured threshold in a real Chain MCP log scan.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs whale --config configs/ten/whale.json --output my-whale.json --evidence my-whale-mcp.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Five distinct addresses: config.addresses and output.addresses.
- Per-token threshold: config.tokens[].threshold in human token units.
- Decoded sender, recipient, amount, mint/transfer context and known labels: moves[].
- Combined per-address summary and fixed scanned block interval: summary and range.

## Captured evidence

- [whale output](../../evidence/ten/whale.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

The demo watchlist was selected from public onchain activity, not the user's wallets. Labels are explicit configuration; unknown addresses remain literal. This command reports a bounded recent range. Long-running cursor monitoring is a separate extension, not claimed here.

This task has been implemented and locally verified. It has not been submitted to Arena in this batch and has no awarded points.
