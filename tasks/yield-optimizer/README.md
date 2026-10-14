# yield-optimizer

Three live historical share-price yields are available: JTRSY, HYB and deJTRSY. They are annualized observations over roughly 9.9 days, not forward APYs or promises. Actual entry/exit fees and native-gas conversion to USDC remain unknown; default output is unknown, so full recommendation evidence is pending.

Run: node scripts/remaining-defi.mjs yield --config configs/remaining/defi.json

Optional explicit policy: add fees keyed by vault ID, each with entryFee and exitFee fractions. optimizer provides principal, days, minDays, current and gasCost in underlying quote units. These assumptions are disclosed separately from live yields. Formula: move capital after current exit and destination entry fees compounds over the holding period, then destination exit applies; compare with staying and exiting at horizon; subtract gas. Minimum holding period and positive net gain gate recommendations. No keys or broadcasts.

Evidence: evidence/remaining/defi/live-result.json. Tests include negative economics, profitable policy scenario, missing sources and overflow.

Validation: `node --test tests/remaining-defi.test.mjs`

Primary sources: [Centrifuge deployments](https://docs.centrifuge.io/developer/protocol/deployments/), [vault semantics](https://docs.centrifuge.io/user/concepts/vaults/), [Morpho official SDK addresses](https://github.com/morpho-org/sdks/blob/main/packages/morpho-ts/src/addresses.ts). Original source snapshots are under evidence/remaining/defi. ABI decoding and deployed bytecode were checked; this is not full compiler bytecode equivalence verification.

Additional cost scenario: `node scripts/remaining-defi-yield-cost.mjs` reads actual Pharos gas price, combines it with explicitly assumed 600000 gas units, 1 USDC/PROS and 0.5% entry/exit fees, then compares three previously captured live yields. `evidence/remaining/defi/yield-cost-scenarios.json` contains a positive-net recommendation, high-cost stay-put, minimum-holding stay-put and unknown-fee default. Under these assumptions the captured 90-day HYB projection adds about 253.29 USDC versus staying on 10000 USDC. These are scenario assumptions, not verified fees or an executable transaction cost. The yield snapshot block and fresh gas quote provenance are distinct.
