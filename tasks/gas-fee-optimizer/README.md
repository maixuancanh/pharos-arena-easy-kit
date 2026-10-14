# Gas Fee Optimizer

The persistent queue holds expensive requests until favorable gas or a configurable deadline lead. Broadcasting and receipt collection use separate phases and short disk locks: a pending receipt or slow quote does not block another deadline. Broadcast ambiguity is persisted and never automatically retried. Restart preserves pending jobs. Receipt hash is checked before fee accounting.

Run from repo root:

    npm ci --ignore-scripts
    node scripts/remaining-execution-worker.mjs
    node --test tests/remaining-gas-deadline.test.mjs tests/remaining-execution.test.mjs

The real wall-clock demo uses local chain31337, 200ms lead and 20ms polling. Mining is paused; first transaction stays pending while the second deadline is dispatched. A background gas quote takes 1500ms; dispatch uses the cached quote. Both node acceptance timestamps precede deadlines. Mining resumes and actual receipts compare gasUsed * paidPrice with gasUsed * requestTimePrice. Favorable job pays less; deadline job is sent even when gas is high. Restart broadcasts zero duplicates.

Evidence: [gas-worker.json](../../evidence/remaining/execution/gas-worker.json). Implementation: [GasQueue](../../src/remaining/execution.mjs), [worker](../../scripts/remaining-execution-worker.mjs).

API: tick(now, price, submit, {waitForReceipts:false}) returns after broadcast; reconcile(getReceipt) collects receipts independently. dispatchLeadMs is per job; submitTimeoutMs is bounded. The runner owns signing, gas cache freshness and polling. Production unsigned user approvals require sufficient lead; the demo only uses disposable local keys.

Deadline means broadcast acceptance, not mining. The demonstrated timing scope is a healthy host and responsive signer/RPC within the lead margin. A suspended host or unavailable network can miss deadlines; lateness and ambiguous outcomes are exposed. No unconditional real-world timing guarantee or public-chain broadcast is claimed. Atomic state locks may require manual reconciliation after a crash. Local hashes are not Pharos explorer transactions.
