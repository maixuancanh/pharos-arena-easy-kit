# Multi-protocol Aggregator

One interface queries positions/rates and prepares unsigned deposits/withdrawals across vaults. Architecture: read-only transport -> pinned-block vault adapters -> same-asset/capacity filter -> observed-yield ranking -> unsigned calldata -> eth_call preflight. Deposit selects the highest observed yield with capacity; withdrawal selects lower yield first to preserve better earning positions. An unavailable vault is isolated; a failed preflight emits a reason without an executable transaction.

Run:

    node scripts/remaining-defi-integration-demo.mjs
    node --test tests/remaining-defi-evm.test.mjs tests/remaining-defi.test.mjs

The integration harness deploys two funded vaults sharing a real local ERC20, seeds100 shares in each and backs controlled price increases with reserves. The same query/preparation functions read both vaults, select Vault-B for27.5 LABUSD deposit and Vault-A for10.4 LABUSD withdrawal, and pass eth_call preflight. Preparation leaves block height unchanged. Only the local harness signs the returned transactions to prove balances: shares end at90 in Vault-A and125 in Vault-B. Receipts and token accounting are recorded. Disabling Vault-B routes to Vault-A; removing allowance blocks preparation.

Evidence: [integration-evm.json](../../evidence/remaining/defi/integration-evm.json). Contracts: [DefiLab.sol](../../contracts/remaining/DefiLab.sol). Three additional public Centrifuge adapters and Pharos MCP reads: [live-result.json](../../evidence/remaining/defi/live-result.json).

Public queries: node scripts/remaining-defi.mjs portfolio. Public unsigned claim preparation: aggregate --action deposit --amount 1. Async request: aggregate --mode request --venue JTRSY --action deposit --amount 1 (withdraw uses shares). Centrifuge requests require eligibility and later settlement; the inspected public addresses reverted and remain blocked. The complete successful action demo uses purpose-built local chain31337 vaults, not a claim of eligible mainnet investment or asynchronous settlement. No user keys or public broadcasts. Local contracts are not audited. Video is encouraged by the task but optional; none is attached. Organizer acceptance of this local demonstration is unconfirmed.
