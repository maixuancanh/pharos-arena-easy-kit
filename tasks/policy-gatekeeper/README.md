# Policy Gatekeeper

[Arena task](https://pharos-agent-arena.vercel.app/tasks/policy-gatekeeper) · Medium · Batch order 6/10

## Result

One allowed read-only call and one actual denied configuration for each spend, allowlist and trusted UTC time-window rule. Denied requests did not invoke their action.

## Install and run

From this repository root with Node.js 22+:

`npm ci`

```sh
node ten.mjs policy --config configs/ten/policy.json --output my-policy.json --evidence my-policy-mcp.jsonl
```

Change wallet, contract, dates or JSON thresholds to your own public-data inputs. Use your own output paths to preserve captured evidence. Sources: official Chain MCP and Developer Docs MCP where applicable; history/profile reports explicitly use PharosScan's public indexer. No signing or broadcasting is performed.

## Requirement mapping

- Three configured rule types: policy.maxValueWei, allowlist and utcWindow.
- Every request has allow/deny plus deciding rule and all-rule trace.
- Each deny has executed=false; only allow invokes eth_call.
- All decisions append to output.audit.jsonl.

## Captured evidence

- [policy-allow output](../../evidence/ten/policy-allow.json)
- [policy-spend-deny output](../../evidence/ten/policy-spend-deny.json)
- [policy-address-deny output](../../evidence/ten/policy-address-deny.json)
- [policy-time-deny output](../../evidence/ten/policy-time-deny.json)

The matching MCP/Docs/indexer transcripts and console captures are in [evidence/ten](../../evidence/ten). Test fixtures are separate from these live outputs. Earlier initial samples are retained but the named current outputs above are the verified versions.

## Limits

This demo Skill gates read-only eth_call simulations. It is not a production signing gateway. No private key or broadcast method exists. UTC windows use the trusted host clock, not a client-supplied timestamp.

Submitted to Arena on 14 October 2026. Status verified: IN REVIEW; no points awarded at that check. See evidence/ten/submissions.json for the submission record.
