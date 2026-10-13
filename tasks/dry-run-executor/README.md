# Dry-Run Executor

[Arena task](https://pharos-agent-arena.vercel.app/tasks/dry-run-executor) · Medium · Batch order 8/10

## Result

A successful read-only ERC20 transfer simulation estimated 79757 gas and 797570000000000 wei. An excessive transfer reverted and invoked the executor zero times.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs dry-run --config configs/ten/dry-run.json --output my-dry-run.json --evidence my-dry-run-mcp.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- eth_call and estimate_gas are used without broadcasting.
- Predicted success/revert, provider reason and estimated gas/cost are reported.
- Token balances before and predicted balances after are included.
- Failed simulation barrier: executorInvocations=0 and executed=false.

## Captured evidence

- [dry-run-success output](../../evidence/ten/dry-run-success.json)
- [dry-run-revert output](../../evidence/ten/dry-run-revert.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

The successful sender is a public funded EOA used for simulation only; ownership is not claimed. Expected balances assume a standard non-fee ERC20. Gas estimate uses current state while the call/balance reads use a fixed block. Successful execution only prepares an unsigned transaction; actual signing/broadcasting is outside this build.

This task has been implemented and locally verified. It has not been submitted to Arena in this batch and has no awarded points.
