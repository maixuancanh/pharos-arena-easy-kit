import {appendFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {address} from './core.mjs';
export const EXPLORER='https://api.socialscan.io/pharos-mainnet';
export async function explorerGet(path,evidence){
 const url=EXPLORER+path;let response;for(let attempt=0;attempt<3;attempt++){response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(response.status!==429&&response.status<500)break;await sleep((attempt+1)*3000);}
 if(!response.ok)throw new Error(`Explorer HTTP ${response.status} for ${path}`);const result=await response.json();if(evidence){mkdirSync(dirname(evidence),{recursive:true});appendFileSync(evidence,JSON.stringify({capturedAt:new Date().toISOString(),url,result})+'\n');}return result;
}
export async function history(wallet,range,{evidence,maxPages=20,token=false}={}){
 wallet=address(wallet);if(!Number.isSafeInteger(maxPages)||maxPages<1||maxPages>100)throw new Error('maxPages must be 1..100');let total=0,complete=false,pages=0;const rows=[],seen=new Set();
 for(let page=1;page<=maxPages;page++){
  const path=`/v1/explorer/address/${wallet}/${token?'token_transfers?type=ERC20&':'transactions?'}size=100&page=${page}`;
  const result=await explorerGet(path,evidence);if(!Array.isArray(result.data))throw new Error('Invalid explorer history');total=result.total;pages++;
  for(const row of result.data){const time=Date.parse(row.block_timestamp);if(!Number.isFinite(time))throw new Error('Invalid transaction timestamp');const key=token?`${row.transaction_hash}:${row.log_index}`:row.hash;if(time>=range.start&&time<range.end&&!seen.has(key)){rows.push(row);seen.add(key);}}
  const oldest=Math.min(...result.data.map(t=>Date.parse(t.block_timestamp)));
  if(result.data.length<100||page*100>=Number(total)||oldest<range.start){complete=true;break;}await sleep(400);
 }
 return {wallet,rows,coverage:{complete,pages,maxPages,totalIndexed:total,since:range.since,until:range.until,source:'PharosScan/SocialScan public indexer',warning:complete?'Indexer coverage reached requested start; this does not prove indexer completeness.':'Page cap reached; this report is partial.'}};
}
export async function profile(wallet,evidence){return explorerGet(`/v1/explorer/address/${address(wallet)}/profile`,evidence);}
