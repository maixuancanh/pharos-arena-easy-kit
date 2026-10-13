# pharos-dry-run operations

## Command template

`node ten.mjs dry-run --config configs/ten/dry-run.json --output my-dry-run.json --evidence my-dry-run-mcp.jsonl`

## Parameters

Config is JSON. from, to, contract and amount define the simulated transfer. amount is integer raw token units, not a floating-point human amount.

## Output and errors

The helper returns structured JSON with the Skill package SHA-256 and live input provenance. Read sender and recipient balances, perform eth_call and estimate_gas, and estimate cost using the current gas quote. Decode success or the provider revert error. If any simulation step fails, block the executor. A successful executor prepares an unsigned request only; it never signs or broadcasts.

All underlying Chain MCP methods are read-only. Network errors terminate with a nonzero exit code or a structured failed simulation. The helper does not request private keys or credentials.
