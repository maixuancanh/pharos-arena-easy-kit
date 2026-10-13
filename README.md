# Pharos Arena Easy Kit

**Submission status (14 October 2026): all six Easy tasks are IN REVIEW under @maixuancanh.** [Public proof page](https://maixuancanh.github.io/pharos-arena-easy-kit/) · [Repository](https://github.com/maixuancanh/pharos-arena-easy-kit). No points awarded yet.

Three independently runnable submissions for **Pharos Season of AI / Agent Arena**, built and exercised on 13 October 2026. The tools use the official hosted MCP servers, not a local RPC substitute.

| Task | What runs | Evidence |

|---|---|---|

| [Read Contract State](https://pharos-agent-arena.vercel.app/tasks/read-contract-state) | Four ERC-20 values at one pinned mainnet block | [Task README](tasks/read-contract-state/README.md) |

| [Event/Log Monitor](https://pharos-agent-arena.vercel.app/tasks/event-log-monitor) | Continuous Transfer polling, decoding, checkpoints and deduplication | [Task README](tasks/event-log-monitor/README.md) |

| [Doc-Search CLI](https://pharos-agent-arena.vercel.app/tasks/doc-search-cli) | Natural-language documentation answers with source links | [Task README](tasks/doc-search-cli/README.md) |

Open **[index.html](index.html)** for a readable evidence report. These are dated captures, not a live dashboard. [RESEARCH.vi.md](RESEARCH.vi.md) contains Vietnamese campaign research; [SUBMISSION.md](SUBMISSION.md) contains English submission copy and the remaining publishing steps.

## Install and run

Requires Node.js 22 or newer. No wallet, private key, paid model API or MCP API key is required.

```powershell

cd pharos-arena-easy-kit

npm ci

npm test

npm run read

npm run monitor

npm run docs -- "What is the Pharos Pacific mainnet chain ID and RPC URL?"

```

On another machine, change into the extracted project directory instead. `npm run monitor` runs until Ctrl+C. It starts with the latest 100 confirmed blocks, then watches new blocks. The default confirmation delay is three blocks, not a claim of finality.

```powershell

# Capture reproducible proof; use your own output filenames to preserve bundled evidence.

node cli.mjs read --output my-read.json --evidence my-read-mcp.jsonl

node cli.mjs monitor --polls 15 --interval 5000 --state .state/my-run.json --output my-monitor.json --evidence my-monitor-mcp.jsonl

node cli.mjs docs "How do I deploy a Solidity contract on Pharos with Foundry?" --output my-docs.json --evidence my-docs-mcp.jsonl

# Continue from the same checkpoint. Do not pass --from when resuming.

node cli.mjs monitor --polls 2 --state .state/my-run.json

# Start an explicit historical range in a separate checkpoint.

node cli.mjs monitor --from 20146900 --polls 1 --state .state/history.json

```

Use `--address` to select a different standard ERC-20 on Pharos Pacific mainnet. Both chain commands verify chain ID 1672. The default USDC address comes from the [official token registry](https://docs.pharos.xyz/getting-started/token-registry): `0xc879c018db60520f4355c26ed1a6d572cdac1815`.

## How it works

- Chain MCP: `https://mcp.pharos.xyz/mcp`. `get_chain_info`, `get_code`, `eth_call` and `get_logs` are called through the official MCP SDK over Streamable HTTP.

- Developer Docs MCP: `https://docs.pharos.xyz/~gitbook/mcp`, advertised by the official docs site. `askQuestion` provides the synthesized answer and its documentation sources. The wrapper does not generate its own factual answer or replace MCP with web scraping.

- ethers decodes contract results and Transfer logs. Token amounts retain exact integer precision.

- Every optional evidence JSONL record includes the endpoint, timestamp, tool name, arguments and original MCP result. Unit-test fixtures are separate from live captures.

- Only a small read-only tool allowlist is exposed. No signing/broadcasting or documentation-feedback method is called.

## Verified result

- 9 unit tests passed.

- Four USDC values read at mainnet block **20147121**: name `USDC`, symbol `USDC`, decimals `6`, supply `17255330.463491`.

- Initial monitor: **15 polls, 17 unique Transfer logs**, including **3 logs from blocks produced after monitoring started**.

- Resume: two further polls, three additional logs, zero repeated identities across the two runs.

- Three documentation queries returned sourced answers. One deliberately unsupported query returned `no-answer`.

See [evidence/summary.json](evidence/summary.json), original MCP transcripts, and [evidence/tests.txt](evidence/tests.txt). These are local functional results; none of the submissions has been approved or awarded points.

## Boundaries

The monitor checkpoints after each successful batch and uses a lock to prevent two processes using the same checkpoint. After an abnormal OS/process crash, inspect the process before removing a stale `.lock` file. Output and checkpoint files are not one transaction: a crash between the two can replay a batch. Deep chain reorganizations are not reconciled. Three successive polling failures terminate with exit code 1; rerun to resume. `--output` retains events in memory and is intended for bounded evidence runs; use ordinary streaming stdout for long runs.

The contract reader supports standard ERC-20 string metadata. Tokens using bytes32 metadata or missing view functions return an error. Documentation answers are provided by the upstream Docs MCP; source presence is checked, but this is not an independent semantic proof that every upstream claim is correct. Command snippets in those answers are printed as text and never executed.

## Package

`src/` contains the three tasks and their MCP adapter; `cli.mjs` provides the command line. `test/` covers pinned blocks, precision, incorrect network, empty bytecode, log filtering, pagination, deduplication and errors. `evidence/` contains public read-only data and official task snapshots. Dependencies are pinned in `package-lock.json`; dependencies and local checkpoints are excluded from the ZIP.

## Three additional Easy builds

[Public evidence page](https://maixuancanh.github.io/pharos-arena-easy-kit/more.html) · [Reviewer notes](SUBMISSION-MORE.md)

- [Docs MCP Onboarding](tasks/docs-mcp-onboarding/README.md): five-question docs-only exercise, four observed gaps and a working read-only connection. Existing client and bootstrap knowledge are disclosed.
- [On-chain Alert Bot](tasks/on-chain-alert-bot/README.md): configurable threshold, real ntfy delivery, archived service readback and persistent duplicate suppression.
- [DApp Support Agent](tasks/dapp-support-agent/README.md): transaction/receipt through Chain MCP, original PharosScan trace, and three actual failed transaction examples. SPL0 is decoded but its contract-specific meaning remains unverified.

Use `node more.mjs alert ...` or `node more.mjs support TXHASH`; see each task README for complete commands and limits. `npm test` covers threshold precision, notification retries/deduplication, ABI error decoding and conservative failure classification.


## Ten more tasks (Medium to Hard)

[Batch overview](TEN-TASKS.md) · [Public proof](https://maixuancanh.github.io/pharos-arena-easy-kit/ten.html) · [Latest weekly digest](https://maixuancanh.github.io/pharos-arena-easy-kit/digest-latest.html)

The ten new implementations are runnable through `node ten.mjs`. They have separate task READMEs, live capture outputs, original MCP/indexer transcripts and explicit coverage limits. Nine are Medium and the final Doc-Grounded Builder is Hard. These ten are implemented but have not been submitted to Arena. The earlier six submissions are unchanged.

Four local Skill packages follow the documented SkillEngine knowledge-package format. Their helpers evaluate policies, chain conditions or preflight simulations, and retain the Skill file hash. No hosted SkillEngine runtime or Anvita publication is claimed. Nothing signs or broadcasts a transaction.

The weekly digest GitHub workflow generates current/previous seven-day reports and deploys the static proof site every Monday at 07:00 Vietnam time, with manual dispatch available. A local worker can also run at the default seven-day interval, but local output reaches the public page through deployment.
