import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const state=read('evidence/read-final-output.json');
const monitor=read('evidence/monitor-output.json');
const resume=read('evidence/monitor-resume-output.json');
const docs=['network','deploy','logs','no-answer'].map(key=>({key,...read(`evidence/docs-${key}.json`)}));
const lines=fs.readFileSync('evidence/monitor-console.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
const polls=lines.filter(x=>x.kind==='poll').length;
const live=monitor.events.filter(x=>x.observedAfterStart);
assert.equal(state.chainId,1672);
assert.equal(monitor.events.length,new Set(monitor.events.map(e=>e.id)).size);
assert.ok(live.length>0,'Must capture a new event after start');
assert.ok(polls>1,'Must demonstrate continuous polling');
assert.equal(resume.events.filter(e=>monitor.events.some(p=>p.id===e.id)).length,0);
assert.ok(docs.slice(0,3).every(d=>d.status==='answered'&&d.sources.length>0));
assert.equal(docs[3].status,'no-answer');
const summary={verifiedAt:new Date().toISOString(),read:{block:state.block,contract:state.contract,supply:state.totalSupply},monitor:{polls,uniqueEvents:monitor.events.length,eventsAfterStart:live.length,firstLiveEvent:live[0],resumeEvents:resume.events.length,duplicatesAcrossRuns:0},docs:{answered:3,noAnswer:1},submissionStatus:'not submitted',publicationStatus:'public repository and GitHub Pages',potentialBasePoints:150};
fs.writeFileSync('evidence/summary.json',JSON.stringify(summary,null,2)+'\n');
function write(file,text){fs.mkdirSync(file.slice(0,file.lastIndexOf('/')),{recursive:true});fs.writeFileSync(file,text);}
write('tasks/read-contract-state/README.md',`# Pharos USDC State Reader

[Arena task](https://pharos-agent-arena.vercel.app/tasks/read-contract-state) · Easy · 50 potential points

## Install and run

From the repository root, with Node.js 22+:

\`npm ci\`

\`node cli.mjs read --output my-read.json --evidence my-read-mcp.jsonl\`

Contract: **${state.contract}**, USDC from the [official Pacific token registry](https://docs.pharos.xyz/getting-started/token-registry). No wallet is needed.

## Actual sample output

Captured ${state.capturedAt}; this is a snapshot, not a current balance claim.

\`\`\`json
${JSON.stringify(state,null,2)}
\`\`\`

## Requirements

- Four values from one deployed contract via Chain MCP: name, symbol, decimals and totalSupply.
- Contract address and block are included. Every view call is pinned to block ${state.block}.
- Total supply is formatted with token decimals using exact integer arithmetic.
- This README provides the selected contract, installation, run command and sample output.

[Original MCP transcript](../../evidence/read-final-mcp.jsonl) · [JSON output](../../evidence/read-final-output.json) · [Implementation](../../src/read.mjs)

Status: implemented and run locally against mainnet. Reviewer approval is pending.
`);
write('tasks/event-log-monitor/README.md',`# Pharos USDC Transfer Monitor

[Arena task](https://pharos-agent-arena.vercel.app/tasks/event-log-monitor) · Easy · 50 potential points

## Install and run

Node.js 22+, from the repo root:

\`\`\`sh
npm ci
node cli.mjs monitor
\`\`\`

Runs continuously until Ctrl+C. Filter: USDC **${state.contract}**, topic **0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef**. Default polling is 5 seconds, with three confirmation blocks. First run backfills 100 recent confirmed blocks. Later runs resume from the saved checkpoint.

For bounded evidence capture:

\`\`\`sh
node cli.mjs monitor --polls 15 --state .state/demo.json --output my-monitor.json --evidence my-monitor-mcp.jsonl
node cli.mjs monitor --polls 2 --state .state/demo.json
\`\`\`

Do not pass --from when resuming. To start from a specific block, use --from and a fresh --state filename. Do not share a checkpoint between simultaneous processes.

## Actual live event

The initial run completed **${polls} polls**, capturing **${monitor.events.length} distinct events**, **${live.length} after-start events**. Resume captured **${resume.events.length} additional events**, with zero duplicate identities across runs.

\`\`\`json
${JSON.stringify(live[0],null,2)}
\`\`\`

[Observed transaction](${live[0].explorer}). This was an existing public user's transaction; the monitor did not create it.

## Requirements

- Chain MCP get_logs filters by address and Transfer signature.
- Polling continues until stopped; pagination uses no more than 1,000 blocks per query.
- Decodes from, to, amount, transaction hash and block; tx hash + log index deduplicates logs.
- Captured new mainnet events while the monitor was already running.

The cursor advances only after a successful batch; state is written atomically and guarded with a lock. A crash between stdout and checkpoint can replay a batch; deep reorgs are not reconciled. Confirmation depth is a delay, not a finality guarantee. Failed queries are retried on the next poll; three consecutive failures stop the process.

[Console capture](../../evidence/monitor-console.jsonl) · [Raw MCP](../../evidence/monitor-mcp.jsonl) · [Resume output](../../evidence/monitor-resume-output.json) · [Implementation](../../src/monitor.mjs)

Status: implemented and live-tested. Reviewer approval is pending.
`);
write('tasks/doc-search-cli/README.md',`# Pharos Docs Answer CLI

[Arena task](https://pharos-agent-arena.vercel.app/tasks/doc-search-cli) · Easy · 50 potential points

## Install and run

Node.js 22+, from repository root:

\`\`\`sh
npm ci
node cli.mjs docs "What is the Pharos Pacific mainnet chain ID and RPC URL?"
\`\`\`

Add --output my-answer.json and --evidence my-docs-mcp.jsonl to save the answer and original MCP result. No model API key is needed. This wraps askQuestion on **https://docs.pharos.xyz/~gitbook/mcp**, the Developer Docs MCP endpoint advertised by the official documentation site.

## Three actual example queries and outputs

${docs.slice(0,3).map((d,i)=>`### ${i+1}. ${d.question}\n\nCommand:\n\n\`node cli.mjs docs "${d.question}"\`\n\nCaptured: ${d.capturedAt}. Status: **${d.status}**.\n\n${d.answer}\n\n[Full JSON](../../evidence/docs-${d.key}.json) · [MCP transcript](../../evidence/docs-${d.key}-mcp.jsonl)`).join('\n\n')}

## No-answer behavior

Query: ${docs[3].question}

\`\`\`json
${JSON.stringify(docs[3],null,2)}
\`\`\`

Empty or unsourced answers and explicit no-result responses become no-answer. Transport/server failures are reported as errors (exit 1), not disguised as successful searches. Upstream answers are cited but not independently fact-checked; the wrapper never executes returned shell instructions.

## Requirements

- Natural-language input from the terminal.
- Concise synthesized answer plus documentation references.
- Clear no-answer behavior, with an actual unsupported-query test.
- Installation, usage and three complete example outputs in this README.

[Implementation](../../src/docs.mjs) · [No-answer MCP transcript](../../evidence/docs-no-answer-mcp.jsonl)

Status: implemented and live-tested. Reviewer approval is pending.
`);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=x=>`<pre>${esc(JSON.stringify(x,null,2))}</pre>`;
const details=(title,body)=>`<details><summary>${esc(title)}</summary>${body}</details>`;
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pharos Arena — Three Easy Builds</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f6fa;color:#18213b;font:16px/1.6 system-ui,sans-serif}main{max-width:1050px;margin:auto;padding:42px 24px}header{background:#07194b;color:white;padding:34px;border-radius:20px}h1{font-size:clamp(28px,5vw,46px);line-height:1.12;max-width:760px;margin:15px 0}h2{margin:0 0 12px;font-size:26px}h3{font-size:17px}small,.muted{color:#57657d}header .muted{color:#c3d4ef}.tag{display:inline-block;background:#244180;padding:4px 12px;border-radius:20px;font-size:13px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0}.stat{background:white;padding:20px;border:1px solid #dbe2ef;border-radius:12px}.stat b{display:block;font-size:29px;color:#123ca6}section{margin:22px 0;background:#fff;border:1px solid #dbe2ef;border-radius:16px;padding:26px;scroll-margin-top:15px}nav{display:flex;gap:20px;flex-wrap:wrap;margin:22px 0}a{color:#174ba9;text-underline-offset:3px}pre{padding:16px;background:#101b31;color:#e1eaff;border-radius:10px;overflow:auto;max-height:500px;font:13px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}code{overflow-wrap:anywhere}summary{cursor:pointer;font-weight:600;padding:12px 0}details{border-top:1px solid #e2e8f0}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;overflow-wrap:anywhere}.note{padding:16px;background:#edf3ff;border-radius:10px}footer{font-size:14px;color:#57657d} @media(max-width:600px){main{padding:16px}.stats{grid-template-columns:1fr}header,section{padding:20px}}
</style><main><header><span class="tag">Pharos Season of AI · Evidence pack</span><h1>Three tools. Real MCP calls.<br>Inspectable results.</h1><p class="muted">Contract state reader, continuous event monitor and sourced documentation CLI.</p><p>Captured on 13 October 2026 · Pharos Pacific mainnet · Chain 1672</p></header>
<div class="stats"><div class="stat"><b>3 / 3</b>Tasks exercised against official MCP</div><div class="stat"><b>${monitor.events.length} + ${resume.events.length}</b>Unique Transfer events across two runs</div><div class="stat"><b>150</b>Potential base points after approval</div></div>
<p class="note"><strong>Recorded evidence, not a live dashboard.</strong> Code is runnable locally. Public source and captured evidence prepared for Arena review. No points or video bonuses have been awarded.</p>
<nav><a href="#read">01 Contract state</a><a href="#monitor">02 Event monitor</a><a href="#docs">03 Docs CLI</a><a href="RESEARCH.vi.md">Nghiên cứu tiếng Việt</a><a href="SUBMISSION.md">Submission copy</a></nav>
<section id="read"><small>01 / CHAIN MCP / EASY</small><h2>Read Contract State</h2><p>Four values read from the same USDC contract at one pinned block. Exact decimal formatting, with labeled contract and block.</p><table><tr><th>Value</th><th>Captured result</th></tr><tr><td>Name / symbol</td><td>${esc(state.name)} / ${esc(state.symbol)}</td></tr><tr><td>Decimals</td><td>${state.decimals}</td></tr><tr><td>Total supply</td><td>${esc(state.totalSupply)} USDC</td></tr><tr><td>Block</td><td>${state.block}</td></tr><tr><td>Contract</td><td><code>${esc(state.contract)}</code></td></tr></table><p><a href="tasks/read-contract-state/README.md">Install &amp; run</a> · <a href="evidence/read-final-mcp.jsonl">Original MCP calls</a></p>${details('Inspect output',json(state))}</section>
<section id="monitor"><small>02 / CHAIN MCP / EASY</small><h2>Event/Log Monitor</h2><p>${polls} polls captured ${monitor.events.length} unique Transfer events. ${live.length} were produced after monitoring began. Restarting from the saved cursor captured ${resume.events.length} additional events with no repeated identities.</p><p><strong>First after-start event:</strong> ${esc(live[0].amount)} USDC at block ${live[0].block}. <a href="${esc(live[0].explorer)}">View observed transaction</a>.</p><p class="muted">Filters: USDC address + Transfer signature. Three-block confirmation delay. Deep reorgs and exactly-once delivery across an OS crash are outside this demonstration's guarantees.</p><p><a href="tasks/event-log-monitor/README.md">Install &amp; run</a> · <a href="evidence/monitor-console.jsonl">15-poll console</a> · <a href="evidence/monitor-mcp.jsonl">Original MCP calls</a></p>${details('Inspect a live-captured event',json(live[0]))}${details('Inspect monitor summary',json(summary.monitor))}</section>
<section id="docs"><small>03 / DEVELOPER DOCS MCP / EASY</small><h2>Doc-Search CLI</h2><p>Three real questions returned source-linked answers. An unsupported question returned a clear no-answer result.</p><p><a href="tasks/doc-search-cli/README.md">Install, queries &amp; full outputs</a></p>${docs.map(d=>details(`${d.status==='answered'?'ANSWERED':'NO ANSWER'} — ${d.question}`,`<pre>${esc(d.answer)}</pre><p><a href="evidence/docs-${d.key}-mcp.jsonl">Original MCP response</a></p>`)).join('')}</section>
<section><h2>Reproduce it</h2><pre>npm ci\nnpm test\nnpm run read\nnpm run monitor\nnpm run docs -- "What is the Pharos Pacific mainnet chain ID and RPC URL?"</pre><p>Node.js 22+. No wallet, signing key or MCP API key required. Monitor runs until Ctrl+C.</p><p><a href="README.md">Full README</a> · <a href="evidence/tests.txt">9 passing tests</a> · <a href="evidence/summary.json">Verification summary</a> · <a href="evidence/SHA256SUMS.txt">Evidence checksums</a></p></section><footer>Official services: mcp.pharos.xyz/mcp and docs.pharos.xyz/~gitbook/mcp. Explorer links refer to observed public transactions. Reviewer approval and reward allocation remain with Pharos.</footer></main></html>`;
fs.writeFileSync('index.html',html);
const files=fs.readdirSync('evidence',{recursive:true}).filter(p=>fs.statSync(`evidence/${p}`).isFile()&&p!=='SHA256SUMS.txt').sort();
fs.writeFileSync('evidence/SHA256SUMS.txt',files.map(p=>`${createHash('sha256').update(fs.readFileSync(`evidence/${p}`)).digest('hex')}  ${p.replaceAll('\\','/')}`).join('\n')+'\n');
console.log(JSON.stringify(summary,null,2));
