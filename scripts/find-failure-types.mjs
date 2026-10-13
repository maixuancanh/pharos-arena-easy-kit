import {writeFileSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const base='https://api.socialscan.io/pharos-mainnet';
const failures=[],types=new Set();
for(let page=1;page<=40;page++){
 const r=await fetch(`${base}/v1/explorer/transactions?size=100&page=${page}`);if(!r.ok)throw new Error(`Explorer ${r.status}`);const list=await r.json();
 for(const tx of list.data.filter(x=>x.receipt_status===0)){
  const url=`${base}/v1/explorer/transaction/${tx.hash}/traces`;const response=await fetch(url);if(!response.ok)continue;const trace=await response.json();
  const type=trace.data?.error??'unknown';
  if(!types.has(type)){types.add(type);failures.push({transaction:tx,trace,source:url,capturedAt:new Date().toISOString()});writeFileSync('evidence/support-trace-candidates.json',JSON.stringify(failures,null,2));console.log('TYPE',type,tx.hash,JSON.stringify(trace.data).slice(0,1300));}
 }
 console.log('Explorer page',page,'types',[...types]);if(types.size>=3)break;await sleep(300);
}
