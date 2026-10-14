# Threshold Guardian

[Arena task](https://pharos-agent-arena.vercel.app/tasks/threshold-guardian) · Medium · Batch order 7/10

## Result

Three distinct live signals (native balance, token supply and gas quote) were evaluated. One configurable run fired the token report; another held and did not run the report action.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs guardian --config configs/ten/guardian.json --output my-guardian.json --evidence my-guardian-mcp.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Independent chain inputs: data.observed.native/supply/gas.
- Configurable thresholds/comparators: conditions in guardian configs.
- Decision trace includes every value, threshold and pass/fail.
- Captured outcomes: guardian-fire.json and guardian-hold.json.

## Captured evidence

- [guardian-fire output](../../evidence/ten/guardian-fire.json)
- [guardian-hold output](../../evidence/ten/guardian-hold.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

Fire performs a read-only report, not a rebalance. Supply and native balance are pinned; the gas quote is current and cannot be pinned by this API.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
