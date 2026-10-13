# pharos-state-brief operations

## Command template

`node ten.mjs flow --config configs/ten/flow.json --output my-flow.json --evidence my-flow-mcp.jsonl`

## Parameters

Config is JSON. wallet and optional contract select live sources; request is the human intent retained in the output.

## Output and errors

The helper returns structured JSON with the Skill package SHA-256 and live input provenance. Read the wallet native balance, ERC20 total supply, metadata and gas quote through Chain MCP. Format those values as a human-readable brief and preserve contract, block and original input provenance. Do not fabricate balances, labels or investment advice.

All underlying Chain MCP methods are read-only. Network errors terminate with a nonzero exit code or a structured failed simulation. The helper does not request private keys or credentials.
