# Completing the remaining four Arena builds

User approved implementation on 14 October 2026. Existing task requirements remain the acceptance checklist.

- Gas: separate short disk state transitions, broadcast and receipt collection. A pending receipt cannot block another deadline. Add a configurable dispatch lead time, cached quotes, timeout/ambiguous-outcome handling, and a real wall-clock local EVM demonstration. Submission deadlines concern dispatch/node acceptance, not mining. Host suspension or network outages cannot have an unconditional guarantee; report misses explicitly.
- Lending: replace constant-output fixture with mutable collateral/debt, funded ERC20, allowance checks and oracle changes. Read actual deployed state for healthy/warning/critical/recovery, emit timestamped console alerts, verify repayment in a mined receipt.
- Aggregator: deploy two funded vaults sharing an ERC20 asset. Query live local balances/rates/capacity through the same interface; prepare and simulate unsigned deposits/withdrawals; execute only inside the disposable local lab to prove amounts; demonstrate one unavailable venue and insufficient allowance. Public Pharos adapters remain read-only and permission-aware.
- Yield: refresh three Pharos sources. Use explicit cost budgets in asset units, not an invented PROS exchange rate; include fee provenance and minimum holding gate. Recommendations must be conditional on stated budgets, with unknown costs blocking unconditional output. Demonstrate recommend/stay/unknown.
- Verify regression tests, all demos and public proof. Submit only with precise environment and cost labels. Review queue status is separate from organizer approval.
