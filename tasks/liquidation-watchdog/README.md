# Liquidation Watchdog

Reads collateral, borrow shares, market debt, LLTV and oracle at a pinned block. Warning/critical/target thresholds are configurable. Timestamped console alerts report health and concrete repay/add-collateral quote values. Morpho debt uses virtual assets/shares and upward rounding; stored debt may omit unaccrued interest.

Run the complete integration demo:

    node scripts/remaining-defi-integration-demo.mjs
    node --test tests/remaining-defi-evm.test.mjs tests/remaining-defi.test.mjs

The disposable chain31337 harness deploys funded ERC20, oracle and mutable lending contracts. It supplies200 LABUSD collateral, borrows100 LABUSD, then changes the oracle from1 to0.75 to0.625. The reader observes health1.6 (healthy),1.2 (warning),1.0 (critical). Each risk alert includes a timestamp and repayment guidance. A real local repayment of33.333334 LABUSD restores health above1.5. Token transfer, allowance and position changes are verified by receipts. Values come from deployed contract storage, not constant-return placeholders.

Evidence: [integration-evm.json](../../evidence/remaining/defi/integration-evm.json), including deployments, all receipts, all four observations and read transcript. Source: [DefiLab.sol](../../contracts/remaining/DefiLab.sol), [runner](../../src/remaining/defi-lab.mjs).

For public Pharos, use node scripts/remaining-defi.mjs watchdog --wallet ADDRESS --market MARKET_ID. Repeat through a user-controlled runner. The discovered public Morpho market has zero oracle and is correctly unknown; no meaningful public borrower is claimed. The full demo is an isolated local EVM, not Pharos testnet/mainnet. Lab contracts are not audited; there is no interest or production liquidation engine. Organizer acceptance of local evidence remains their decision.
