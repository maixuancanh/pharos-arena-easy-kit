# portfolio-assistant

Verified live reads from three Centrifuge vaults plus USDC wallet balance. Five question types: balances, USDC location, largest position, earnings, all positions. Every number carries contract/block provenance; yield additionally carries both historical blocks. The default public demonstration address has zero positions; no ownership is claimed.

Run: node scripts/remaining-defi.mjs portfolio --wallet 0x0000000000000000000000000000000000000001 --question "what am I earning?"

Evidence: evidence/remaining/defi/live-result.json and live-mcp.jsonl. Read-only; missing vaults remain explicitly unavailable. The partial outage demonstration injects one failure into a real snapshot and is labelled accordingly. This is not all-wallet discovery: only configured vaults and their underlying tokens are covered.

Validation: `node --test tests/remaining-defi.test.mjs`

Primary sources: [Centrifuge deployments](https://docs.centrifuge.io/developer/protocol/deployments/), [vault semantics](https://docs.centrifuge.io/user/concepts/vaults/), [Morpho official SDK addresses](https://github.com/morpho-org/sdks/blob/main/packages/morpho-ts/src/addresses.ts). Original source snapshots are under evidence/remaining/defi. ABI decoding and deployed bytecode were checked; this is not full compiler bytecode equivalence verification.
