# Three more Arena Easy builds

User request: choose three other Easy tasks, implement them and submit them.

Extend the existing Node.js MCP client without changing the three submitted builds. Use only read-only Chain MCP methods. Publish only public blockchain data and task evidence.

- Docs MCP Onboarding: record a fresh chronological attempt using only Developer Docs MCP answers for onboarding guidance. Ask about setup, capabilities, authentication, limits and recovery. Record at least three actual gaps with exact queries and proposed documentation fixes. End with a working read-only MCP call if achievable, and explicitly separate earlier project knowledge from this fresh exercise.
- On-chain Alert Bot: reuse Transfer decoding, add a configurable decimal threshold and persistent delivery identities, deliver public USDC activity to an isolated ntfy topic, and verify the notification by reading it back. Record restart and below-threshold tests. No Telegram or Discord recipient will be invented.
- DApp Support Agent: accept a transaction hash, fetch transaction and receipt through Chain MCP, attempt a read-only replay and decode Error/Panic reverts. Distinguish historic receipt proof from replay inference. Find and demonstrate three actual failure types; if chain history cannot supply these, report the gap instead of claiming simulated samples are real.

Verification: meaningful tests for threshold precision/deduplication and revert classification; fresh live MCP transcripts; public proof page; GitHub publication; Arena submission confirmation and My work status for each.
