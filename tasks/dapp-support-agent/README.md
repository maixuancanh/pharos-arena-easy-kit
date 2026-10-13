# Pharos Transaction Support Agent

[Arena task](https://pharos-agent-arena.vercel.app/tasks/dapp-support-agent) · Easy

Accepts a transaction hash and fetches the original transaction and receipt through Chain MCP. For a failed receipt, it attempts a read-only replay at the previous block and fetches PharosScan's public trace to distinguish original execution evidence from replay hints. It returns a plain-language explanation and next steps. No wallet or transaction sending is required.

## Run

`npm ci`

`node more.mjs support 0x4196ad6ab953608dcae1dd20c5cfc2e50818fe20649e68eeb1fd93f7e8a7a9cc --output my-diagnosis.json --evidence my-support-mcp.jsonl`

## Three real failure categories

### 1. insufficient-native-balance

[Original transaction](https://pharosscan.xyz/tx/0x4196ad6ab953608dcae1dd20c5cfc2e50818fe20649e68eeb1fd93f7e8a7a9cc) · Block 20154802 · receipt status 0x0

PharosScan reports that the sender did not have enough native coin for this transfer.

**Suggested action:** Check the PROS balance and reduce the transfer amount, leaving enough for fees.

**Trace category:** insufficient_balance

**Original trace source:** https://api.socialscan.io/pharos-mainnet/v1/explorer/transaction/0x4196ad6ab953608dcae1dd20c5cfc2e50818fe20649e68eeb1fd93f7e8a7a9cc/traces

### 2. slippage-minimum-output

[Original transaction](https://pharosscan.xyz/tx/0x6044f77a5ca13bdad37f34f6224911e73a0fb4835a5a263105bfc2b3955de6a9) · Block 20155076 · receipt status 0x0

The swap would return less than the minimum output requested, so the contract stopped it.

**Suggested action:** Refresh the quote, check the route and amount, and use a minimum output consistent with your chosen slippage tolerance. Do not remove the protection just to force execution.

**Trace category:** execute_revert

**Original trace source:** https://api.socialscan.io/pharos-mainnet/v1/explorer/transaction/0x6044f77a5ca13bdad37f34f6224911e73a0fb4835a5a263105bfc2b3955de6a9/traces

### 3. contract-revert

[Original transaction](https://pharosscan.xyz/tx/0xfc04ecf08781883a68a82bcfcbaecea33011680cfc089f084438e7ad60d65939) · Block 20155073 · receipt status 0x0

The contract refused the request: SPL0. This code is preserved exactly; its contract-specific meaning is not verified.

**Suggested action:** Check recipient, amounts and contract restrictions. Simulate again before sending; ask the dApp to explain the exact returned code.

**Trace category:** execute_revert

**Original trace source:** https://api.socialscan.io/pharos-mainnet/v1/explorer/transaction/0xfc04ecf08781883a68a82bcfcbaecea33011680cfc089f084438e7ad60d65939/traces

## Evidence limits

These are three different provider failure categories from real failed Pacific transactions, not manufactured transactions or local fixtures. The three examples are insufficient native balance, swap output below the minimum, and a contract rejection with decoded reason SPL0. The SPL0 code is preserved exactly, but its contract-specific meaning has not been verified; the agent does not invent an explanation for it. Generic execute_failure cases were investigated and then replaced by the clearer recorded examples.

A replay at block N-1 is not the precise pre-state of a transaction inside block N. Replay errors are diagnostic hints; the original receipt proves failure and the separately attributed PharosScan trace supplies the historic category. Explorer trace availability is a dependency; if unavailable, the agent reports weaker evidence. Pending, missing and successful transactions are handled separately.

Evidence: [three diagnoses including original receipts and traces](../../evidence/support-three.json), [Chain MCP transcript](../../evidence/support-three-mcp.jsonl), [initial candidate traces](../../evidence/support-trace-candidates.json), [specific revert candidates and source URLs](../../evidence/support-specific-candidates.json).

Run meaningful regression checks with `npm test`. Captured evidence can be rechecked with `node scripts/verify-more.mjs`.
