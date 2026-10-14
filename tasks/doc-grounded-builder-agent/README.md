# Doc-Grounded Builder Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/doc-grounded-builder-agent) · Hard · Batch order 10/10

## Result

Three different supported how-do-I requests were planned with sourced Docs MCP answers, executed through Chain MCP, and verified. An unsupported banana-on-Mars request was refused without a chain action.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs builder "How do I read my native PROS balance on Pharos?" --wallet 0x200a5eb1477503cfc6e64fd8116c1bb967ba22c1 --output my-builder.json --evidence my-builder-mcp.jsonl --docs-evidence my-builder-docs.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Docs MCP plan, cited sources and resolved target precede chain execution.
- Only fixed read-only operations are executed; no downloaded prose is run.
- Same-block result is read back and compared to the plan operation.
- Three requests: total supply, token decimals and native PROS balance.
- Unsupported/unsourced/mixed intents are refused rather than improvised.

## Captured evidence

- [builder-supply output](../../evidence/ten/builder-supply.json)
- [builder-decimals output](../../evidence/ten/builder-decimals.json)
- [builder-native output](../../evidence/ten/builder-native.json)
- [builder-unsupported output](../../evidence/ten/builder-unsupported.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

This Hard-task build has a bounded three-intent scope. It does not synthesize arbitrary contract code or deploy contracts. Verification is same-provider consistency, not independent corroboration.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
