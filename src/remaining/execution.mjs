import {existsSync,readFileSync,writeFileSync,renameSync,mkdirSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {dirname} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
export const json=value=>JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v,2);
export function readState(path,fallback){return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):fallback;}
export function saveState(path,value){mkdirSync(dirname(path),{recursive:true});writeFileSync(path+'.tmp',json(value));renameSync(path+'.tmp',path);}
function lock(path){mkdirSync(dirname(path),{recursive:true});const fd=openSync(path+'.lock','wx');return()=>{closeSync(fd);unlinkSync(path+'.lock');};}
export function receiptData(r){if(!r||r.status==null||![0,1].includes(Number(r.status)))throw Error('Receipt missing or unresolved');if(Number(r.status)===0)throw Object.assign(Error('Receipt reverted'),{permanent:true,receipt:r});return {hash:r.hash??r.transactionHash,blockNumber:r.blockNumber,status:Number(r.status),gasUsed:String(r.gasUsed),gasPrice:String(r.gasPrice??r.effectiveGasPrice),actualPaidWei:String(BigInt(r.gasUsed)*BigInt(r.gasPrice??r.effectiveGasPrice))};}

export function observeTrend(path,observation,{count=3,direction='down'}={}){
 if(!Number.isInteger(count)||count<3||!['down','up'].includes(direction))throw Error('Trend requires count >= 3 and up/down direction');
 if(!observation.id||!Number.isFinite(observation.value)||!Number.isFinite(observation.at))throw Error('Invalid observation');
 const release=lock(path);try{
 const s=readState(path,{history:[],events:[],active:false,rule:{count,direction}});
 if(s.rule.count!==count||s.rule.direction!==direction)throw Error('Rule changed; use separate history');
 if(s.history.some(x=>x.id===observation.id))return {duplicate:true,triggered:false};
 if(s.history.length&&observation.at<=s.history.at(-1).at)throw Error('Observation out of order');
 s.history.push(observation);const window=s.history.slice(-count);
 const confirmed=window.length===count&&window.slice(1).every((v,i)=>direction==='down'?v.value<window[i].value:v.value>window[i].value);
 const triggered=confirmed&&!s.active;s.active=confirmed;
 if(triggered)s.events.push({at:observation.at,observationId:observation.id,rule:s.rule,window:window.map(x=>x.id),action:'console-alert'});
 saveState(path,s);return {triggered,duplicate:false,confirmed,event:triggered?s.events.at(-1):null,historyLength:s.history.length};
 }finally{release();}
}

export async function scanArbitrage(path,sources,{now,quantity=1,feeBps=30,slippageBps=20,gasCost=1,threshold=1,maxAgeMs=30000,maxSkewMs=5000}={}){
 if(sources.length<2)throw Error('At least two price sources required');
 for(const x of [quantity,feeBps,slippageBps,gasCost,threshold,maxAgeMs,maxSkewMs])if(!Number.isFinite(x)||x<0)throw Error('Invalid nonnegative cost/configuration');
 if(!quantity||feeBps>=10000||slippageBps>=10000)throw Error('Invalid quantity or basis points');
 const settled=await Promise.allSettled(sources.map(f=>Promise.resolve().then(f)));now??=Date.now();const row={at:now,executionMode:'simulated-only',sources:settled.map(r=>r.status==='fulfilled'?r.value:{error:String(r.reason?.message??r.reason)}),decision:'skip',gross:null,costs:null,net:null};
 const quotes=row.sources;
 if(quotes.some(q=>!q||q.error||!q.source||!Number.isFinite(q.price)||q.price<=0||!Number.isFinite(q.at)||q.at>now||now-q.at>maxAgeMs))row.reason='unavailable, invalid, future or stale source';
 else if(new Set(quotes.map(q=>q.source)).size<2||Math.max(...quotes.map(q=>q.at))-Math.min(...quotes.map(q=>q.at))>maxSkewMs)row.reason='sources must be distinct and contemporaneous';
 else {
 const buy=quotes.reduce((a,b)=>a.price<b.price?a:b),sell=quotes.reduce((a,b)=>a.price>b.price?a:b);
 const buyNotional=quantity*buy.price,sellNotional=quantity*sell.price;row.gross=sellNotional-buyNotional;
 row.swapFees=(buyNotional+sellNotional)*feeBps/10000;row.slippage=(buyNotional+sellNotional)*slippageBps/10000;row.gasCost=gasCost;row.costs=row.swapFees+row.slippage+gasCost;row.net=row.gross-row.costs;
 row.threshold=threshold;row.decision=row.net>threshold?'prepare-simulated':'skip';row.reason=row.net>threshold?'net profit exceeds threshold':'net profit does not exceed threshold';
 if(row.decision==='prepare-simulated')row.prepared={buy:buy.source,sell:sell.source,quantity,maxBuyPrice:buy.price*(1+slippageBps/10000),minSellPrice:sell.price*(1-slippageBps/10000),broadcast:false};
  if(![row.gross,row.costs,row.net,row.swapFees,row.slippage].every(Number.isFinite)){row.decision='skip';row.reason='numeric overflow in estimated costs or profit';delete row.prepared;for(const key of ['gross','costs','net','swapFees','slippage'])if(!Number.isFinite(row[key]))row[key]=null;}
 }
 const release=lock(path);try{const s=readState(path,{scans:[]});s.scans.push(row);saveState(path,s);}finally{release();}return row;
}

export class GasQueue {
 constructor(path){this.path=path;}
 enqueue(job){
  if(!job.id||!Number.isFinite(job.deadline)||!Number.isFinite(job.requestedAt)||job.deadline<=job.requestedAt||BigInt(job.requestPriceWei)<=0n||BigInt(job.targetPriceWei)<=0n||!job.transaction)throw Error('Invalid gas queue job');
  const release=lock(this.path);try{const s=readState(this.path,{history:[],jobs:[]});if(s.jobs.some(x=>x.id===job.id))throw Error('Duplicate job');s.jobs.push({...job,status:'queued'});saveState(this.path,s);}finally{release();}
 }
 async tick(now,priceWei,submit){
  if(!Number.isFinite(now)||BigInt(priceWei)<=0n)throw Error('Invalid observation');
  const release=lock(this.path);try{
  const s=readState(this.path,{history:[],jobs:[]});s.history.push({at:now,priceWei:String(priceWei)});saveState(this.path,s);const results=[];
  const pending=[];
  for(const job of s.jobs.filter(x=>x.status==='queued')){
   if(now<job.deadline&&BigInt(priceWei)>BigInt(job.targetPriceWei))continue;
   job.reason=now>=job.deadline?'deadline':'favorable-gas';job.latenessMs=Math.max(0,now-job.deadline);job.submittedAt=now;job.status='submitting';saveState(this.path,s);
   try{const tx=await submit(job.transaction,priceWei);job.hash=tx.hash;job.status='pending';saveState(this.path,s);pending.push({job,tx});}
   catch(e){job.error=e.message;job.status=e.permanent?'failed':'needs-reconciliation';saveState(this.path,s);results.push({...job});}
  }
  await Promise.all(pending.map(async({job,tx})=>{try{const r=receiptData(await tx.wait());Object.assign(job,{receipt:r,actualPaidWei:r.actualPaidWei,requestTimeBenchmarkWei:String(BigInt(r.gasUsed)*BigInt(job.requestPriceWei)),status:'confirmed'});job.savedWei=String(BigInt(job.requestTimeBenchmarkWei)-BigInt(job.actualPaidWei));}catch(e){job.error=e.message;job.status=e.permanent?'failed':'needs-reconciliation';}saveState(this.path,s);results.push({...job});}));return results;
  }finally{release();}
 }
}

export async function runSaga(path,steps,{maxAttempts=3,retryDelayMs=50}={}){
 if(steps.length<3||new Set(steps.map(x=>x.id)).size!==steps.length||steps.some(x=>!x.id))throw Error('Three distinct dependent steps required');
 if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>10||retryDelayMs<0)throw Error('Invalid bounded retry policy');
 const release=lock(path);try{
 const s=readState(path,{status:'running',steps:steps.map(x=>({id:x.id,status:'ready',attempts:0})),log:[]});
 if(s.steps.map(x=>x.id).join()!==steps.map(x=>x.id).join())throw Error('Saga definition mismatch');
 const log=(event,step,detail={})=>{s.log.push({at:new Date().toISOString(),event,step,...detail});saveState(path,s);};
 if(['completed','compensated','needs-reconciliation','compensation-failed'].includes(s.status))return s;
 // A persisted submitting/pending marker is deliberately never rebroadcast after restart.
 if(s.steps.some(x=>['submitting','pending','compensating','compensation-pending'].includes(x.status))){s.status='needs-reconciliation';log('restart-requires-receipt-reconciliation');return s;}
 for(let i=0;i<steps.length&&s.status==='running';i++){
  const def=steps[i],st=s.steps[i];if(st.status==='confirmed')continue;
  if(st.attempts>=maxAttempts){st.status='failed';s.status='compensating';log('retry-budget-exhausted',st.id);break;}
  while(st.attempts<maxAttempts){
   st.attempts++;st.status='submitting';log('sending',st.id,{attempt:st.attempts});let tx;
   try{tx=await def.send(s);st.hash=tx.hash;st.status='pending';log('broadcast',st.id,{hash:tx.hash});st.receipt=receiptData(await tx.wait());st.status='confirmed';log('receipt-verified',st.id,{hash:st.hash});break;}
   catch(e){st.error=e.message;if(e.receipt)st.failedReceipt={hash:e.receipt.hash??e.receipt.transactionHash,status:Number(e.receipt.status),blockNumber:e.receipt.blockNumber,gasUsed:String(e.receipt.gasUsed),gasPrice:String(e.receipt.gasPrice??e.receipt.effectiveGasPrice)};
    if(!tx&&e.transient&&e.safeToRetry&&st.attempts<maxAttempts){st.status='ready';log('retry',st.id);await sleep(retryDelayMs*st.attempts);continue;}
    if(e.permanent||(!tx&&e.safeToRetry)){st.status='failed';s.status='compensating';log('permanent-failure',st.id);}
    else {st.status='unknown';s.status='needs-reconciliation';log('ambiguous-outcome',st.id);}
    break;
   }
  }
 }
 if(s.status==='running'){s.status=s.steps.every(x=>x.status==='confirmed')?'completed':'needs-reconciliation';log(s.status);}
 if(s.status==='compensating'){
  for(let i=steps.length-1;i>=0;i--){const st=s.steps[i];if(st.status!=='confirmed')continue;
   if(!steps[i].compensate){s.status='compensation-failed';log('missing-compensation',st.id);break;}
   st.status='compensating';log('compensation-sending',st.id);
   try{const tx=await steps[i].compensate(s);st.compensationHash=tx.hash;st.status='compensation-pending';log('compensation-broadcast',st.id,{hash:tx.hash});st.compensationReceipt=receiptData(await tx.wait());st.status='compensated';log('compensation-verified',st.id);}
   catch(e){s.status=e.permanent?'compensation-failed':'needs-reconciliation';st.error=e.message;log('compensation-error',st.id);break;}
  }
  if(s.status==='compensating'){s.status='compensated';log('compensated');}
 }return s;
 }finally{release();}
}
