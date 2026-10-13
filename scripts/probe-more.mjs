import {connect,CHAIN_MCP,DOCS_MCP} from '../src/mcp.mjs';
import {writeFileSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const mode=process.argv[2];
const c=await connect(mode==='docs'?DOCS_MCP:CHAIN_MCP,`evidence/${mode}-probe-mcp.jsonl`);
try {
 if(mode==='docs') {
  const questions=[
   'I am onboarding to ai.pharos.xyz for the first time. Give exact steps to connect Developer Docs MCP and Chain MCP in a Node.js MCP SDK client and perform a read-only call. What are their exact endpoint URLs?',
   'What authentication headers or API keys are required for https://mcp.pharos.xyz/mcp and https://docs.pharos.xyz/~gitbook/mcp? Show a minimal complete Node.js SDK example with transport and session termination.',
   'What are the exact Chain MCP tool names and argument schemas for get_chain_info, get_transaction and get_transaction_receipt? How do I select Pacific mainnet versus Atlantic testnet?',
   'For ai.pharos.xyz Chain MCP get_logs, what is the maximum inclusive block range, rate limit, and correct retry behavior after HTTP 429? Provide exact documented values, not generic advice.',
   'How do I create and run my first SkillEngine skill on ai.pharos.xyz? Give the exact skill file schema, execution endpoint, authentication and a complete read-only sample.'
  ];
  const out=[];
  for(const question of questions){const answer=await c.raw('askQuestion',{question,goal:'Use only Pharos Developer Docs. Cite sources. If details are missing, explicitly say so; do not guess.'});out.push({step:out.length+1,question,answer,capturedAt:new Date().toISOString()}); writeFileSync('evidence/onboarding-questions.json',JSON.stringify(out,null,2)); console.log('Question',out.length,'saved');}
 } else {
  const info=await c.call('get_chain_info'); console.log(info);
  const failures=[];let scanned=0;
  for(let b=Number(process.argv[3]??info.latestBlock)-3;b>Number(process.argv[3]??info.latestBlock)-1000;b--) {
   await sleep(650);
   const block=await c.call('get_block',{block:b,includeTransactions:true});
   for(const tx of block.transactions??[]) {
    const hash=typeof tx==='string'?tx:tx.hash;
    await sleep(650);const receipt=await c.call('get_transaction_receipt',{hash});scanned++;
    if(receipt&&Number(receipt.status)===0){const transaction=typeof tx==='string'?await c.call('get_transaction',{hash}):tx; let replay;try{replay=await c.raw('eth_call',{transaction:{from:transaction.from,to:transaction.to,data:transaction.input,value:transaction.value,gas:transaction.gas},block:b-1});}catch(e){replay=e.message;}
     failures.push({transaction,receipt,replay});writeFileSync('evidence/failed-candidates.json',JSON.stringify(failures,null,2));console.log('FAILED',hash,JSON.stringify(replay).slice(0,600));}
   }
   if(b%10===0)console.log('block',b,'scanned',scanned,'failed',failures.length);
   if(failures.length>=15)break;
  }
 }
}finally{await c.close();}
