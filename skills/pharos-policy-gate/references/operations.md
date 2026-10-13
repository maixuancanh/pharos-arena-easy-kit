# pharos-policy-gate operations

## Command template

`node ten.mjs policy --config configs/ten/policy.json --output my-policy.json --evidence my-policy-mcp.jsonl`

## Parameters

Config is JSON. policy.maxValueWei, policy.allowlist and policy.utcWindow define the three policy rules; request is an eth_call transaction. UTC hours use an inclusive start and exclusive end.

## Output and errors

The helper returns structured JSON with the Skill package SHA-256 and live input provenance. Evaluate the policy against exact transaction.value in wei, allowlisted transaction.to and the trusted host clock. On any deny, do not invoke Chain MCP. Append the decision to the audit log. A permitted request invokes eth_call only; no signing or broadcast path exists.

All underlying Chain MCP methods are read-only. Network errors terminate with a nonzero exit code or a structured failed simulation. The helper does not request private keys or credentials.
