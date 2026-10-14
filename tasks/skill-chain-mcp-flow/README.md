# Skill + Chain MCP Flow

[Arena task](https://pharos-agent-arena.vercel.app/tasks/skill-chain-mcp-flow) · Medium · Batch order 9/10

## Result

A single account/state request loaded the local state-brief Skill, fetched live Chain MCP balance/supply/gas/metadata, and produced a brief from those exact inputs.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs flow --config configs/ten/flow.json --output my-flow.json --evidence my-flow-mcp.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Live inputs in the same flow: data and token fields with MCP provenance.
- One request: flow CLI and request property.
- Order: user request → local Skill → Chain MCP reads → formatted Skill output.
- Actual real-chain inputs and local Skill package SHA-256 are saved.

## Captured evidence

- [flow output](../../evidence/ten/flow.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

SkillEngine follows the official knowledge-package pattern; these are custom local Skills, not an invented hosted runtime or an Anvita deployment. The native balance and supply snapshot share one block; token metadata/report calls may use a later block and both are shown.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
