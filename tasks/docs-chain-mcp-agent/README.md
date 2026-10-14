# Docs MCP + Chain MCP Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/docs-chain-mcp-agent) · Medium · Batch order 1/10

## Result

Sourced Docs MCP explanations were followed by real Chain MCP calls to totalSupply and decimals. Both reads were verified at a pinned block.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs compose "How do I read ERC20 totalSupply on Pharos?" --wallet 0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1 --output my-compose.json --evidence my-compose-mcp.jsonl --docs-evidence my-compose-docs.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Sourced explanation: plan.answer and original Docs MCP transcript.
- Same function call: result.function and original eth_call arguments.
- Contextual output: interpretation, raw result and optional humanValue.
- Two distinct functions: totalSupply and decimals.

## Captured evidence

- [compose-totalSupply output](../../evidence/ten/compose-totalSupply.json)
- [compose-decimals output](../../evidence/ten/compose-decimals.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

Only whitelisted read-only intents are supported. Same-provider same-block read repetition checks consistency, not independent-provider agreement. Mixed write/read requests and mismatched targets are refused.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
