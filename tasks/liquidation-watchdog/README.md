# liquidation-watchdog

Implementation and synthetic warning/critical alerts are available; full live lending-position evidence is pending. The official Morpho Pharos core bytecode was verified, and its deployment CreateMarket event was found. That market has zero token/oracle fields and cannot supply a meaningful collateral health factor. Its zero-valued position is reported unknown, never healthy.

Run: node scripts/remaining-defi.mjs watchdog --wallet 0x0000000000000000000000000000000000000001 --market 0xfe1d7da2fbde85b1fee120c88df3e6b55164a2442dab97486d3d4f719a5ff1fb

Supply a real Morpho market ID and borrower to use the same reader. Config thresholds warning=1.3, critical=1.1, target=1.5. Console JSON includes timestamps and concrete repay/add collateral quote-value amounts. It reads collateral, borrow shares, market totals, LLTV and oracle at one block. Debt uses Morpho virtual shares/assets and upward rounding, but stored market totals exclude unaccrued interest; re-accrual is required before executing mitigation.

Evidence: actions-lending.json, watchdog-cli.json and original MCP JSONL under evidence/remaining/defi. Synthetic alerts are explicitly separated in live-result.json. No continuous scheduler is claimed; repeat CLI through a user-controlled runner.

Validation: `node --test tests/remaining-defi.test.mjs`

Primary sources: [Centrifuge deployments](https://docs.centrifuge.io/developer/protocol/deployments/), [vault semantics](https://docs.centrifuge.io/user/concepts/vaults/), [Morpho official SDK addresses](https://github.com/morpho-org/sdks/blob/main/packages/morpho-ts/src/addresses.ts). Original source snapshots are under evidence/remaining/defi. ABI decoding and deployed bytecode were checked; this is not full compiler bytecode equivalence verification.

Local EVM verification: `node scripts/remaining-defi-local-demo.mjs` deploys an actual local contract with deterministic collateral, debt and oracle outputs, reads it through the same Morpho adapter, and asserts a warning plus concrete repayment amount. `evidence/remaining/defi/local-evm.json` contains the local deployment receipt, chain reads and alert. This is a fixture on an isolated local EVM, not a real public lending position. Current Zona documentation lists Robinhood chain 4663; those addresses are not passed off as Pharos deployments.
