# pharos-threshold-guardian operations

## Command template

`node ten.mjs guardian --config configs/ten/guardian.json --output my-guardian.json --evidence my-guardian-mcp.jsonl`

## Parameters

Config is JSON. wallet and contract select sources; conditions contains three or more distinct signal/comparator/threshold entries. Supported signals are nativeBalanceWei, supplyRaw and gasPriceWei.

## Output and errors

The helper returns structured JSON with the Skill package SHA-256 and live input provenance. Fetch native balance and token supply at a pinned block plus the current gas quote through Chain MCP. Evaluate every configurable comparison and log its value, threshold and pass/fail. Fire the read-only token state report only if all pass. On hold, do not run the report action.

All underlying Chain MCP methods are read-only. Network errors terminate with a nonzero exit code or a structured failed simulation. The helper does not request private keys or credentials.
