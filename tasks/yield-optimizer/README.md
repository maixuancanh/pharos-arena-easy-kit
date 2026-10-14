# Yield Optimizer

Compares three live Pharos vault share-price histories: JTRSY, HYB and deJTRSY. The recommendation wrapper accepts explicit entry/exit fee inputs and a total gas budget in the underlying asset, respects a minimum holding horizon, and reports projected net gain plus break-even gas. Missing costs return unknown; a short horizon or negative economics returns stay put. There are no signatures or broadcasts.

Run:

    node scripts/remaining-yield-policy-demo.mjs
    node --test tests/remaining-yield-policy.test.mjs tests/remaining-defi.test.mjs

The demo refreshes onchain yields and native gas via Pharos Chain MCP. Native quote is context only; no PROS/USDC conversion is invented. Example policy uses 0.5% entry/exit allowances and a total 5 USDC gas budget, 10000 USDC principal, 90-day horizon and 30-day minimum. These are disclosed cost inputs, not measured investor fees. Recommendation is conditional on those costs, eligibility, settlement and historical returns repeating. It is not a verified executable investment quote.

At captured block20186816 the conditional HYB result adds about247.98 USDC versus staying. See exact current numbers in [yield-policy.json](../../evidence/remaining/defi/yield-policy.json) and original [MCP transcript](../../evidence/remaining/defi/yield-policy-mcp.jsonl). Results can change on rerun.

CLI supports config.costPolicy: {kind: 'user-supplied-budget', asset: assetContractAddress, gasBudget: quoteAssetAmount, fees: {vaultId: {entryFee: fraction, exitFee: fraction, source: provenance}}}. optimizer supplies current, principal, days, minDays. Without the policy, the existing unknown-cost guard remains.

Formula compounds capital after current exit and destination entry fees, applies destination exit at horizon, compares against staying and exiting, then deducts total gas budget. Historical annualized share-price change is not forward APY. Public reads are chain1672; fee terms and total gas cost must be verified for the investor before action. Source: [Centrifuge pricing](https://docs.centrifuge.io/user/concepts/pricing/) and [investor flow](https://docs.centrifuge.io/user/investor/).
