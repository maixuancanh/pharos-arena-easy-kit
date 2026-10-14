# multi-protocol-aggregator

Three Centrifuge vaults share one query/action interface. Architecture: Chain MCP read-only transport -> pinned-block vault adapter -> capacity/asset route filter -> yield ranking -> encoded unsigned transaction -> eth_call preflight. One unavailable venue is isolated. Deposits choose highest observed yield; withdrawals preserve better earning holdings by selecting lowest yield first. Exact BigInt amounts prevent rounding at token precision.

Run queries: node scripts/remaining-defi.mjs portfolio
Run synchronous claim preparation: node scripts/remaining-defi.mjs aggregate --action deposit --amount 1
Run asynchronous request preparation: node scripts/remaining-defi.mjs aggregate --mode request --venue JTRSY --action deposit --amount 1
Withdrawal request: same command with --action withdraw; amount is shares, not underlying assets.

A request is not completed settlement. Centrifuge requires asynchronous processing and often investor permissions. Default address has no balance/claimable capacity: both synchronous and async routes are blocked, with real revert evidence. Unsigned preparation success is unit-tested using a labelled mock, but a successful live preflight from an eligible funded wallet remains pending. No fabricated signature request is emitted on revert. No video has been produced.

Evidence: live-result.json, actions-lending.json and original MCP JSONL in evidence/remaining/defi.

Validation: `node --test tests/remaining-defi.test.mjs`

Primary sources: [Centrifuge deployments](https://docs.centrifuge.io/developer/protocol/deployments/), [vault semantics](https://docs.centrifuge.io/user/concepts/vaults/), [Morpho official SDK addresses](https://github.com/morpho-org/sdks/blob/main/packages/morpho-ts/src/addresses.ts). Original source snapshots are under evidence/remaining/defi. ABI decoding and deployed bytecode were checked; this is not full compiler bytecode equivalence verification.

Local EVM verification: `node scripts/remaining-defi-local-demo.mjs` deploys two minimal fixture contracts, performs four successful unsigned request preflights, and verifies no action broadcasts. `evidence/remaining/defi/local-evm.json` includes actual local deployment receipts and read transcripts. This fixture omits KYC/balances/settlement deliberately; it verifies adapter execution only, not Centrifuge mainnet eligibility. A funded public-address JTRSY request also reverted (see funded-public-request.json).
