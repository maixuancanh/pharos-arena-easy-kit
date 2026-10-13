# Three additional Easy submissions

Public repo: https://github.com/maixuancanh/pharos-arena-easy-kit

## Docs MCP Onboarding

Proof: https://maixuancanh.github.io/pharos-arena-easy-kit/more.html#onboarding

Reviewer notes:

A fresh docs-only onboarding exercise with five exact questions, full answers, four concrete gaps and suggested fixes, and a working read-only Chain MCP run. All Pharos onboarding guidance in this exercise came from Developer Docs MCP. Starting context is disclosed: the existing Node.js client and Docs MCP bootstrap endpoint were already available from earlier builds, so this is not a first-ever onboarding claim. Runtime tools/list supplied missing argument schemas. The final run returned Pacific chain ID 1672. Full log, original transcripts and run instructions are linked on the proof page. No SkillEngine execution or transaction submission is claimed.

## On-chain Alert Bot

Proof: https://maixuancanh.github.io/pharos-arena-easy-kit/more.html#alerts

Reviewer notes:

A configurable USDC Transfer alert bot using Chain MCP and a real ntfy notification channel (the similar-channel option in the task). Threshold is 1000 USDC. Five first-run notifications and one restart notification were delivered and read back from ntfy with matching IDs/messages. Below-threshold events were filtered. An already delivered event was replayed and suppressed without a network request. Each alert includes amount, addresses, block and explorer link. Source, MCP transcripts, archived notification readback and restart evidence are linked on the proof page. Ordinary restart deduplication is supported; a crash between delivery acknowledgement and the local checkpoint can still produce a duplicate. The demo topic is public and hosted message history expires. No Telegram or Discord delivery is claimed.

## DApp Support Agent

Proof: https://maixuancanh.github.io/pharos-arena-easy-kit/more.html#support

Reviewer notes:

A transaction support CLI that accepts a hash, fetches the transaction and receipt through Chain MCP, and explains failures using a separately attributed PharosScan historical trace. Three real failed Pacific transactions demonstrate insufficient native balance, a swap rejected because output was below the minimum, and a contract rejection with decoded reason SPL0. Each has a plain-language explanation, next steps, explorer link and original evidence. SPL0 is preserved exactly; its contract-specific meaning is not verified and is not invented. A replay at the previous block is only a diagnostic hint, not exact historical pre-state. Generic execution failure candidates were replaced by these clearer examples. No transactions were sent by this build.

No video links are included in these three new submissions. Review status and awarded points must be verified in Arena after submission.
