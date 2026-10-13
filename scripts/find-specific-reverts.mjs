import {writeFileSync,readFileSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const base='https://api.socialscan.io/pharos-mainnet',out=[];const seen=new Set();
for(let page=1;page<=40;page++){
 const response=await fetch(`${base}/v1/explorer/transactions?size=100&page=${page}`);if(!response.ok)break;const list=await response.json();
 for(const tx of list.data.filter(x=>x.receipt_status===0&&x.method_id!=='0x')){
  if(seen.has(tx.hash))continue;seen.add(tx.hash);const url=`${base}/v1/explorer/transaction/${tx.hash}/traces`;const r=await fetch(url);if(!r.ok)continue;const trace=await r.json();out.push({transaction:tx,trace,source:url,capturedAt:new Date().toISOString()});writeFileSync('evidence/support-specific-candidates.json',JSON.stringify(out,null,2));console.log('Contract failure',tx.hash,trace.data?.error,trace.data?.output?.slice(0,250));
 }
 console.log('Search page',page,'contract failures',out.length);
 if(out.some(x=>/0x08c379a0|0x4e487b71/i.test(x.trace.data?.output??'')))break;
 await sleep(500);
}
