# Pharos Arena Easy Kit — design and implementation plan

Date: 2026-10-13 (Asia/Saigon).

Goal: complete Read Contract State, Event/Log Monitor and Doc-Search CLI against the public official MCP servers, preserving verifiable evidence.

Architecture: three CLI commands share a remote MCP SDK client; ethers handles ERC-20 ABI decoding and exact decimal formatting. No signing or wallet access is needed. Each task gets its own README and submission text. A static evidence page makes captured outputs reviewable without presenting old captures as live data.

Alternatives considered: a hosted chatbot adds authentication and deployment overhead; Docs MCP Onboarding would require three genuine observed breakdowns and cannot be preselected with guaranteed completion. These three scripts have explicit, independently testable acceptance criteria.

## Files and validation

- [x] `test/core.test.mjs`: failing tests for pinned block reads, exact token units, continuous monitor paging and deduplication, no cursor advancement on failed queries, empty/unsourced documentation answers.
- [x] `src/mcp.mjs`: official SDK Streamable HTTP client, discovery, structured/text tool results, bounded request timeout, read-only tool allowlist, optional JSONL evidence.
- [x] `src/read.mjs`: verify chain 1672; pin every read to one block; read name, symbol, decimals, totalSupply of a public token from the official registry. Print contract/block and labeled values.
- [x] `src/monitor.mjs`: verify chain; filter Transfer by address and signature; query at most 1000 blocks; poll continuously; persist cursor only after successful decoding/output. Track transaction/log identity. Bounded run mode exists for evidence.
- [x] `src/docs.mjs`: askQuestion through official Developer Docs MCP; natural-language input; source references required; no-result/unsupported answer state instead of fabricated content.
- [x] `cli.mjs`: argument validation, graceful shutdown, separate raw evidence and human output, install/usage commands.
- [x] Run `npm test`, then all three commands against official hosted MCP servers. Capture a real event while polling, three doc query outputs and a no-answer query. Keep fixtures clearly separate from live evidence.
- [x] `README.md`, task READMEs, `RESEARCH.vi.md`, `SUBMISSION.md`, static evidence `index.html`: acceptance checklist, source links, run results, publication/submission status and unverified campaign terms.

Publication and submission: local artifacts are authorized by the request. Public hosting or GitHub publication should be offered as a concrete finished package unless the user explicitly requests it. No social post, registration form or Arena submission is sent in this build request.

## Acceptance and limitations

150 base points are only potential points after approval. Videos and approval are not part of a CLI run. Rank basis conflicts between supplied announcement and current Arena. Blog retrieval was blocked; deadline and prize distribution remain unverified. Monitor uses a confirmation delay; deep reorgs and exactly-once output across an OS crash are not guaranteed. Document these limits rather than claiming production finality.
