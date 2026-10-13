# Ten new Pharos Arena tasks

Selected from the live task board on 14 October 2026. The six Easy tasks are already submitted; this batch contains nine Medium tasks and one Hard task. Official requirements are archived in ten-task-requirements.json.

## Design and implementation order

1. Docs MCP + Chain MCP Agent: source explanations of ERC-20 view functions, call the same whitelisted functions at a pinned block, decode and explain their output.
2. Audit-Log Agent: accept wallet and ISO date interval, paginate public explorer history, group transfers, swaps, approvals and other contract calls, export Markdown and CSV. Explicitly report incomplete coverage.
3. Whale-Watching Agent: five configurable public addresses, per-token thresholds, decoded Transfer logs through Chain MCP, labels only where verified/configured, combined summary.
4. Wallet Risk Checker: contract verification, age, failed-transaction fraction, flagged-counterparty exposure and unlimited approvals. Unknown data must not count as a clean signal. Use live examples and disclose heuristic scoring.
5. Weekly Digest Agent: compare current and previous periods, top three events, published HTML; weekly default scheduler and bounded accelerated live schedule verification.
6. Policy Gatekeeper: local Skill with spend, allowlist and UTC window rules. Check trusted clock and exact integer values, log each decision, and call read-only MCP only after allow. Capture allow and a deny for each rule.
7. Threshold Guardian: local Skill that reads native balance, ERC-20 supply and gas price from Chain MCP. Configurable conditions, trace each pass/fail; capture one fire and one hold. Fire performs a read-only state report.
8. Dry-Run Executor: local Skill with eth_call and estimate_gas preflight, costs, predicted token balances and a failed-simulation execution barrier. No signing or broadcasting implementation.
9. Skill + Chain MCP Flow: one request runs a packaged Skill using live Chain MCP data and persists a provenance trace. SkillEngine is a knowledge package, not an invented remote runtime.
10. Doc-Grounded Builder Agent: Docs MCP plan before execution, three whitelisted read-only intents, same-block verification and unsupported-intent refusal. Source content is never executed as shell commands.

## Files and verification

- src/ten/core.mjs: date validation, activity grouping, policy/risk/guardian logic. Test boundaries with exact amounts and negative cases before implementation.
- src/ten/explorer.mjs: source URLs, bounded pagination, original response recording and coverage metadata.
- src/ten/chain.mjs: pinned chain snapshots, ERC-20 ABI, event decoding, simulated transfers. All calls use the read-only MCP allowlist.
- src/ten/docs-agent.mjs: source-grounded planning and strict intent routing; unsupported and unsourced plans fail closed.
- src/ten/jobs.mjs and ten.mjs: independently runnable commands and configurable schedule worker.
- skills/<name>/SKILL.md and references/operations.md: SkillEngine-compatible knowledge packages, with explicit commands, outputs and boundaries.
- scripts/capture-ten.mjs: execute in the order above, save original MCP/explorer transcripts and outputs in evidence/ten/.
- tasks/<slug>/README.md, ten.html and TEN-TASKS.md: requirements mapping, run commands, evidence links and readiness limits.

Use the existing authenticated public repository. Build on branch codex/pharos-ten-tasks; preserve earlier evidence and unrelated investigation files. Verify the full test suite, live run assertions and links, then request independent code review. No automatic Arena submissions in this batch: the user requested implementation.
